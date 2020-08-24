import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentsPage } from './payments';

import { ComponentsModule } from "../../components/components.module";
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    PaymentsPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentsPage),
    ComponentsModule,
    OrderModule,
  ],
})
export class PaymentsPageModule { }
