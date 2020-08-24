import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CaseStatusModalPage } from './case-status-modal';

import { ComponentsModule } from "../../../components/components.module";

@NgModule({
  declarations: [
    CaseStatusModalPage,
  ],
  imports: [
    IonicPageModule.forChild(CaseStatusModalPage),
    ComponentsModule,
  ],
})
export class CaseStatusModalPageModule {}
