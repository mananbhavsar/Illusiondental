import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationPreferencesPage } from './notification-preferences';

import { ComponentsModule } from "../../../components/components.module";

@NgModule({
  declarations: [
    NotificationPreferencesPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationPreferencesPage),
    ComponentsModule,
  ],
})
export class NotificationPreferencesPageModule {}
