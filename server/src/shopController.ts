import { Config } from '@AthenaPlugins/gp-shop/shared/config';
import { View_Events_GPShop } from '@AthenaPlugins/gp-shop/shared/events';
import IShopListItem, { IShop } from '@AthenaPlugins/gp-shop/shared/interfaces';
import { LOCALE_GP_SHOP } from '@AthenaPlugins/gp-shop/shared/locales';
import { SHOP_TYPES } from '@AthenaPlugins/gp-shop/shared/types';
import { Athena } from '@AthenaServer/api/athena';
import { ServerBlipController } from '@AthenaServer/systems/blip';
import { InteractionController } from '@AthenaServer/systems/interaction';
import { ItemFactory } from '@AthenaServer/systems/item';
import { CurrencyTypes } from '@AthenaShared/enums/currency';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy';
import * as alt from 'alt-server';
import { ShopRegistry } from '../data/shopRegistry';

let shops: IShop[] = [];
export class ShopController {
    static async init() {
        ShopController.initShops();
        alt.onClient(View_Events_GPShop.VS_HandleShop, ShopController.handleShop);
        alt.onClient(View_Events_GPShop.Wheelmenu_OpenShop, ShopController.openPedShop);
    }

    static async initShops() {
        ShopRegistry.forEach(async (shopFromConfig, index) => {
            const shopsFromDB: IShop[] = await Athena.database.funcs.fetchAllByField<IShop>(
                'dbName',
                shopFromConfig.dbName,
                Config.collection,
            );

            let shopFromDB: IShop = null;
            if (shopsFromDB.length > 0 && shopsFromDB[0]) {
                shopFromDB = shopsFromDB[0];
            }

            if (!shopFromDB) {
                alt.logWarning(`Shop ${shopFromConfig.dbName} does not exist in the database -> Created`);
                shopFromDB = await Athena.database.funcs.insertData(shopFromConfig, Config.collection, true);
            } else if (Config.overrideExistingsShopsOnServerStart) {
                alt.logWarning(`Shop ${shopFromDB.dbName} already exists in the database -> Overriding`);
                await Athena.database.funcs.updatePartialData(
                    shopFromDB._id.toString(),
                    shopFromConfig,
                    Config.collection,
                );
            } else {
                alt.logWarning(`Shop ${shopFromDB.dbName} already exists in the database -> Leave as is`);
            }

            for (let i = 0; i < shopFromDB.locations.length; i++) {
                let location = shopFromDB.locations[i];
                if (location.isBlip) {
                    ServerBlipController.append({
                        pos: new alt.Vector3(location.x, location.y, location.z),
                        shortRange: true,
                        sprite: shopFromDB.blipSprite,
                        color: shopFromDB.blipColor,
                        text: shopFromDB.name,
                        scale: shopFromDB.blipScale,
                        uid: `${Config.blipPrefix}_${shopFromDB.dbName}_${i}`,
                    });
                }
                if (location.pedModel) {
                    Athena.controllers.ped.append({
                        model: location.pedModel,
                        pos: new alt.Vector3(location.x, location.y, location.z),
                        heading: location.pedHeading ? location.pedHeading : 0,
                        uid: `${Config.pedPrefix}_${shopFromDB.dbName}_${i}`,
                    });
                } else {
                    InteractionController.add({
                        position: new alt.Vector3(location.x, location.y, location.z),
                        description: LOCALE_GP_SHOP.OPEN_SHOP,
                        range: shopFromDB.interactionRange ? shopFromDB.interactionRange : Config.interactionRange,
                        uid: `${Config.icPrefix}-${shopFromDB.dbName}-${i}`,
                        debug: false,
                        callback: (player: alt.Player) => ShopController.initShopCallback(player, shopFromDB.dbName),
                    });
                }
            }
        });
    }

    static getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static async openPedShop(player: alt.Player, pedUid: string) {
        alt.logWarning(`Ped Shop Opened: ${pedUid}`);
        ShopController.initShopCallback(player, pedUid.split('_')[1]);
    }

    static async initShopCallback(player: alt.Player, shopDbName: string) {
        let shops: IShop[] = await Athena.database.funcs.fetchAllByField<IShop>(
            'dbName',
            shopDbName,
            Config.collection,
        );

        if (shops.length <= 0) {
            alt.logError(`~lr~Shop ${shopDbName} is not in your database!`);
            return;
        }
        let currentShop: IShop = shops[0];
        let dataItems: Array<IShopListItem> = [];
        for (const item of currentShop.data.items) {
            let itemToAdd: IShopListItem = null;
            if (Config.loadShopItemsWithoutItemFactory) {
                itemToAdd = item;
            } else {
                itemToAdd = await ItemFactory.get(item.dbName);
                if (!itemToAdd) {
                    alt.log(`~lr~Item ${item.dbName} is not in your ItemFactory!`);
                    continue;
                }
            }
            itemToAdd.price = itemToAdd.price ? itemToAdd.price : 100;
            dataItems.push(itemToAdd);
        }
        alt.emitClient(player, View_Events_GPShop.SC_OpenShop, dataItems, currentShop.ShopType);
    }

    static async handleShop(player: alt.Player, shopItem: IShopListItem, amount: number, type: string) {
        if (type === SHOP_TYPES.BUY) {
            ShopController.buy(player, shopItem, amount);
        } else if (type === SHOP_TYPES.SELL) {
            ShopController.sell(player, shopItem, amount);
        }
    }

    static async sell(player: alt.Player, shopItem: IShopListItem, amount: number) {
        const itemToAdd = await ItemFactory.get(shopItem.dbName);
        if (!itemToAdd) return;
        if (amount < 1) {
            Athena.player.emit.notification(player, LOCALE_GP_SHOP.NOT_POSSIBLE);
            return;
        }

        const itemIsInInventory = Athena.player.inventory.isInInventory(player, { name: itemToAdd.name });

        if (amount > player.data.inventory[itemIsInInventory.index].quantity) {
            Athena.player.emit.notification(player, `Invalid action.`);
            return;
        }
        player.data.inventory[itemIsInInventory.index].quantity -= amount;
        if (player.data.inventory[itemIsInInventory.index].quantity <= 1) {
            Athena.player.inventory.findAndRemove(player, player.data.inventory[itemIsInInventory.index].name);
        }
        Athena.state.set(player, 'inventory', player.data.inventory);
        Athena.player.sync.inventory(player);
        Athena.player.emit.notification(player, `You've sold ${itemToAdd.name} for ${shopItem.price * amount}$`);
        Athena.player.currency.add(player, CurrencyTypes.CASH, shopItem.price * amount);
        return;
    }

    static async buy(player: alt.Player, shopItem: IShopListItem, amount: number) {
        const itemToAdd = await ItemFactory.get(shopItem.dbName);
        if (!itemToAdd) return;
        if (amount < 1) {
            Athena.player.emit.notification(player, LOCALE_GP_SHOP.NOT_POSSIBLE);
            return;
        }

        const itemIsInInventory = Athena.player.inventory.isInInventory(player, { name: itemToAdd.name });
        const emptySlot = Athena.player.inventory.getFreeInventorySlot(player);

        if (!itemIsInInventory) {
            if (shopItem.price * amount > player.data.cash) {
                Athena.player.emit.notification(player, LOCALE_GP_SHOP.NOT_ENOUGH_CASH);
                return;
            }
            itemToAdd.quantity = amount;
            Athena.player.inventory.inventoryAdd(player, itemToAdd, emptySlot.slot);
            Athena.state.set(player, 'inventory', player.data.inventory);
            Athena.player.sync.inventory(player);
            Athena.player.currency.sub(player, CurrencyTypes.CASH, amount * shopItem.price);
            Athena.player.emit.notification(
                player,
                `You've bought ${itemToAdd.name} x${amount} for ${shopItem.price * amount}$!`,
            );
            return;
        } else if (itemIsInInventory) {
            if (shopItem.price * amount > player.data.cash) {
                Athena.player.emit.notification(player, LOCALE_GP_SHOP.NOT_ENOUGH_CASH);
                return;
            }
            player.data.inventory[itemIsInInventory.index].quantity += amount;
            Athena.state.set(player, 'inventory', player.data.inventory);
            Athena.player.sync.inventory(player);
            Athena.player.currency.sub(player, CurrencyTypes.CASH, amount * shopItem.price);
            Athena.player.emit.notification(player, `You've bought ${itemToAdd.name} for ${shopItem.price * amount}$`);
            return;
        }
    }
}
