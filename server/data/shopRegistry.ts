// import { ammo } from '@AthenaPlugins/gp-items-shared/shared/items/ammo';
// import { construction } from '@AthenaPlugins/gp-items-shared/shared/items/construction';
// import { drinks } from '@AthenaPlugins/gp-items-shared/shared/items/drinks';
// import { drugs } from '@AthenaPlugins/gp-items-shared/shared/items/drugs';
// import { food } from '@AthenaPlugins/gp-items-shared/shared/items/food';
// import { furniture } from '@AthenaPlugins/gp-items-shared/shared/items/furniture';
// import { machines } from '@AthenaPlugins/gp-items-shared/shared/items/machines';
// import { medicin } from '@AthenaPlugins/gp-items-shared/shared/items/medicin';
// import { other } from '@AthenaPlugins/gp-items-shared/shared/items/other';
// import { parts } from '@AthenaPlugins/gp-items-shared/shared/items/parts';
// import { plants } from '@AthenaPlugins/gp-items-shared/shared/items/plants';
// import { poison } from '@AthenaPlugins/gp-items-shared/shared/items/poisons';
// import { resources } from '@AthenaPlugins/gp-items-shared/shared/items/resources';
// import { road } from '@AthenaPlugins/gp-items-shared/shared/items/road';
// import { tools } from '@AthenaPlugins/gp-items-shared/shared/items/tools';
// import { phones } from '@AthenaPlugins/gp-voice/server/src/items/phones';
// import { radios } from '@AthenaPlugins/gp-voice/server/src/items/radios';
import { drinks } from '@AthenaPlugins/core-items/server/src/items/drinks';
import { food } from '@AthenaPlugins/core-items/server/src/items/food';
import { utility } from '@AthenaPlugins/core-items/server/src/items/utility';
import { IShop, ShopType } from '../../shared/interfaces';
import * as Shops from './shopLocations';

export const AllSharedItems = [
    ...food,
    ...drinks,
    ...utility,
];

// export const AllSharedItems = [
//     ...drinks,
//     ...food,
//     ...furniture,
//     ...machines,
//     ...plants,
//     ...drugs,
//     ...medicin,
//     ...poison,
//     ...road,
//     ...tools,
//     ...resources,
//     ...parts,
//     ...ammo,
//     ...construction,
//     ...other,
// ];

export const ShopRegistry: IShop[] = [
    /* {
        name: 'Vending machine',
        dbName: 'VendingMmachine',
        blipSprite: 59,
        blipColor: 2,
        blipScale: 1,
        interactionRange: 1,
        data: {
            items: [{ dbName: 'burger', price: 50 }],
        },
        locations: athenaVendingMachines,
    }, */
    {
        name: '24/7 Shop',
        dbName: '247Shop',
        blipSprite: 59,
        blipColor: 2,
        blipScale: 1,
        data: {
            items: [...AllSharedItems],
        },
        locations: Shops.coreShopLocations,
    },
    {
        name: 'Seller Example',
        dbName: 'SellerExample',
        ShopType: ShopType.SELL,
        blipSprite: 52,
        blipColor: 1,
        blipScale: 1,
        data: {
            // items: [...food],
        },
        locations: Shops.sellerExampleLocations,
    },
    {
        name: 'LTD',
        dbName: 'LTD',
        blipSprite: 59,
        blipColor: 2,
        blipScale: 1,
        data: {
            // items: [...food, ...drinks, ...phones, ...radios],
        },
        locations: Shops.ltdLocations,
    },
    {
        name: 'Robs Liquor',
        dbName: 'RobsLiquor',
        blipSprite: 59,
        blipColor: 2,
        blipScale: 1,
        data: {
            // items: [...drinks],
        },
        locations: Shops.robsLiquorLocations,
    },
    {
        name: 'Juice',
        dbName: 'Juice',
        blipSprite: 59,
        blipColor: 2,
        blipScale: 1,
        data: {
            // items: [...drinks],
        },
        locations: Shops.juiceLocations,
    },
    {
        name: 'Liquor ACE',
        dbName: 'LiquorACE',
        blipSprite: 59,
        blipColor: 2,
        blipScale: 1,
        data: {
            // items: [...drinks],
        },
        locations: Shops.liquorAceLocations,
    },
    {
        name: 'Tool Shop',
        dbName: 'ToolShop',
        blipSprite: 59,
        blipColor: 2,
        blipScale: 1,
        data: {
            // items: [...drinks],
        },
        locations: Shops.toolShopLocations,
    },
    {
        name: 'Ammunation',
        dbName: 'Ammunation',
        blipSprite: 110,
        blipColor: 2,
        blipScale: 1,
        data: {
            // items: [...ammo],
        },
        locations: Shops.ammunationLocations,
    },
    {
        name: 'Tequi-la-la',
        dbName: 'Tequilala',
        blipSprite: 93,
        blipColor: 48,
        blipScale: 1,
        data: {
            // items: [...drinks],
        },
        locations: Shops.tequiLaLaLocations,
    },
    {
        name: 'Bahama Mamas',
        dbName: 'BahamaMamas',
        blipSprite: 93,
        blipColor: 48,
        blipScale: 1,
        data: {
            // items: [...drinks],
        },
        locations: Shops.bahamaMamasLocations,
    },
    {
        name: 'Vanilla Unicorn',
        dbName: 'VanillaUnicorn',
        blipSprite: 93,
        blipColor: 48,
        blipScale: 1,
        data: {
            // items: [...drinks],
        },
        locations: Shops.vanillaUnicornLocations,
    },
];
