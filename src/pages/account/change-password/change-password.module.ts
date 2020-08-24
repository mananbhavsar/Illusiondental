import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePasswordPage } from './change-password';

import { ComponentsModule } from "../../../components/components.module";

@NgModule({
  declarations: [
    ChangePasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ChangePasswordPage),
    ComponentsModule,
  ],
})
export class ChangePasswordPageModule { }
