import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CaseStatusPage } from './case-status';
import { ComponentsModule } from "../../components/components.module";
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    CaseStatusPage,
  ],
  imports: [
    IonicPageModule.forChild(CaseStatusPage),
    ComponentsModule,
    OrderModule,
    PipesModule
  ]
})
export class CaseStatusPageModule {}
