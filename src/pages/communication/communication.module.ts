import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommunicationPage } from './communication';

import { ComponentsModule } from "../../components/components.module";
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    CommunicationPage,
  ],
  imports: [
    IonicPageModule.forChild(CommunicationPage),
    ComponentsModule,
    OrderModule,
  ],
})
export class CommunicationPageModule {}
