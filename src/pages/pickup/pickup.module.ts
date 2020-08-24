import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PickupPage } from './pickup';

import { ComponentsModule } from "../../components/components.module";
import { MomentModule } from 'angular2-moment';

@NgModule({
  declarations: [
    PickupPage,
  ],
  imports: [
    IonicPageModule.forChild(PickupPage),
    ComponentsModule,
    MomentModule,
  ]
})
export class PickupPageModule {}
