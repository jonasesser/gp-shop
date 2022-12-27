import { Item } from '@AthenaShared/interfaces/item';

export default interface IShopListItem extends Item {
    price?: number;
}

export interface IShop {
    _id?: string;
    name: string /* The name of the item in the ItemFactory. */;

    dbName: string;
    ShopType?: ShopType; // BUY || SELL - Default BUY
    shopImage?: string;
    blipShortRange?: boolean;
    blipSprite: number;
    blipColor: number;
    blipScale: number;
    interactionRange?: number;
    factionid?: number;
    data: {
        items?: IShopListItem[];
    };
    locations: IShopLocation[];
}

export interface IShopLocation {
    x: number;
    y: number;
    z: number;
    pedModel?: string;
    pedHeading?: number;
    isBlip?: boolean; //Enable/Disable blip e.g. none for Vendors. Already defined from Athena in shared/information
}

export enum ShopType {
    BUY = 'buy', //Players can buy stuff
    SELL = 'sell', //Players can sell stuff
}
