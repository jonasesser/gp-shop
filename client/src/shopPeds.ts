import * as alt from 'alt-client';
import { NpcWheelMenu } from '@AthenaClient/menus/npc';
import { Config } from '@AthenaPlugins/gp-shop/shared/config';
import { LOCALE_GP_SHOP } from '@AthenaPlugins/gp-shop/shared/locales';
import { IPed } from '@AthenaShared/interfaces/iPed';
import { View_Events_GPShop } from '@AthenaPlugins/gp-shop/shared/events';
import { IWheelOptionExt } from '@AthenaShared/interfaces/wheelMenu';

export class ShopPeds {
    static init() {
        NpcWheelMenu.addInjection(ShopPeds.handleInjection);
    }

    static handleInjection(scriptID: number, ped: IPed, options: Array<IWheelOptionExt>): Array<IWheelOptionExt> {
        // This is not the NPC we are looking for.
        alt.logWarning('ShopPeds.handleInjection()' + ped.uid);
        if (!ped.uid.includes(Config.pedPrefix)) {
            return options;
        }

        alt.logWarning('ShopPeds.handleInjection()' + ped.uid);
        options.push({
            name: LOCALE_GP_SHOP.OPEN_SHOP,
            callback: () => {
                alt.emitServer(View_Events_GPShop.Wheelmenu_OpenShop, ped.uid);
            },
        });

        return options;
    }
}
