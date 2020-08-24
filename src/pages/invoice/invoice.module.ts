import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InvoicePage } from './invoice';

import { ComponentsModule } from "../../components/components.module";
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    InvoicePage,
  ],
  imports: [
    IonicPageModule.forChild(InvoicePage),
    ComponentsModule,
    OrderModule,
  ],
})
export class InvoicePageModule { }
