import * as alt from 'alt-client';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system';
import { ShopView } from './src/shopView';

alt.onceServer(SYSTEM_EVENTS.TICKS_START, ShopView.init);
alt.log(`~ly~Plugin Loaded -- gpShop`);
