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
import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { ShopRegistry } from '../data/shopRegistry';

export class ShopController {
    static async init() {
        ShopController.initShops();
        alt.onClient(View_Events_GPShop.VS_HandleShop, ShopController.handleShop);
    }

    static async initShops() {
        ShopRegistry.forEach(async (shop, index) => {
            let dbShop: IShop = await Database.fetchAllByField<IShop>('dbName', shop.dbName, Config.collection)[0];
            if (!dbShop) {
                dbShop = deepCloneObject(shop);
            }

            if (!dbShop._id) {
                dbShop = await Database.insertData(dbShop, Config.collection, true);
            }

            for (let i = 0; i < dbShop.locations.length; i++) {
                let location = dbShop.locations[i];
                if (location.isBlip) {
                    ServerBlipController.append({
                        pos: new alt.Vector3(location.x, location.y, location.z),
                        shortRange: true,
                        sprite: dbShop.blipSprite,
                        color: dbShop.blipColor,
                        text: dbShop.name,
                        scale: dbShop.blipScale,
                        uid: `Shop-${dbShop.dbName}-${i}`,
                    });
                }
                InteractionController.add({
                    position: new alt.Vector3(location.x, location.y, location.z),
                    description: LOCALE_GP_SHOP.OPEN_SHOP,
                    range: dbShop.interactionRange ? dbShop.interactionRange : Config.interactionRange,
                    uid: `IC-${dbShop.dbName}-${i}`,
                    debug: false,
                    callback: (player: alt.Player) => ShopController.initShopCallback(player, dbShop),
                });
            }
        });
    }

    static getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static async initShopCallback(player: alt.Player, shop: IShop) {
        let currentShop = shop;
        let dbShop: IShop = await Database.fetchAllByField<IShop>('dbName', shop.dbName, Config.collection)[0];
        if (dbShop) {
            currentShop = dbShop;
        }
        let dataItems: Array<IShopListItem> = [];
        for (const item of currentShop.data.items) {
            let factoryItem = await ItemFactory.get(item.dbName);
            if (!factoryItem) {
                alt.log(`~lr~Item ${item.dbName} is not in your ItemFactory!`);
            } else {
                let itemPrice = 100;

                dataItems.push({
                    name: factoryItem.name,
                    dbName: factoryItem.dbName,
                    price: itemPrice,
                    icon: factoryItem.icon,
                    description: factoryItem.description,
                    quantity: factoryItem.quantity,
                    behavior: factoryItem.behavior,
                    data: factoryItem.data,
                });
            }
        }
        alt.emitClient(player, View_Events_GPShop.SC_OpenShop, dataItems, shop.ShopType);
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
