import * as alt from 'alt-server';
import { PluginSystem } from '../../../server/systems/plugins';
import { ShopController } from './src/shopController';

const PLUGIN_NAME = 'gpShop';

PluginSystem.registerPlugin(PLUGIN_NAME, () => {
    ShopController.init();
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});
