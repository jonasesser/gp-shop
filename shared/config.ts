export const Config = {
    collection: 'gpShops',
    overrideExistingsShopsOnServerStart: true,
    loadShopItemsOnServerStart: true, //TODO: NOT IMPLEMENTED - Items will be loaded on server start one time (faster)
    loadShopItemsWithoutItemFactory: true, //Items will be loaded without item factory (much faster)
    interactionRange: 2,
    //NOT change the following values!
    shopPageName: 'GpShop',
    pedPrefix: 'GpShopPed',
    icPrefix: 'GpShopIC',
    blipPrefix: 'GpShopBlip',
};
