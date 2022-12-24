import * as alt from 'alt-client';
import ViewModel from '@AthenaClient/models/viewModel';
import { Config } from '@AthenaPlugins/gp-shop/shared/config';
import { View_Events_GPShop } from '@AthenaPlugins/gp-shop/shared/events';
import { AthenaClient } from '@AthenaClient/api/athena';
import IShopListItem from '@AthenaPlugins/gp-shop/shared/interfaces';

const PAGE_NAME = Config.shopPageName;

let items: Array<IShopListItem> = [];
let shopType = '';

export class ShopView implements ViewModel {
    static init() {
        alt.onServer(View_Events_GPShop.SC_OpenShop, ShopView.open);
    }

    static async open(shopItems: Array<IShopListItem>, type: string) {
        items = shopItems;
        shopType = type;

        if (AthenaClient.webview.isAnyMenuOpen(true)) {
            return;
        }

        AthenaClient.webview.ready(PAGE_NAME, ShopView.ready);
        AthenaClient.webview.open(PAGE_NAME, true, ShopView.close);
        AthenaClient.webview.focus();
        AthenaClient.webview.showCursor(true);
        alt.toggleGameControls(false);
        alt.Player.local.isMenuOpen = true;
    }

    static async close() {
        AthenaClient.webview.unfocus();
        AthenaClient.webview.showCursor(false);
        alt.toggleGameControls(true);
        alt.Player.local.isMenuOpen = false;
    }

    static async ready() {
        AthenaClient.webview.emit(View_Events_GPShop.CV_SetItems, items, shopType);
    }
}
