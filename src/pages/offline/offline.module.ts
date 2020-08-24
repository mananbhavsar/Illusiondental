import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OfflinePage } from './offline';

import { ComponentsModule } from "../../components/components.module";
@NgModule({
  declarations: [
    OfflinePage,
  ],
  imports: [
    IonicPageModule.forChild(OfflinePage),
    ComponentsModule,
  ],
})
export class OfflinePageModule {}
