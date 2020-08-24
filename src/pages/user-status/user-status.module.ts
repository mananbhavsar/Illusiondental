import { ComponentsModule } from './../../components/components.module';
import { OrderModule } from 'ngx-order-pipe';
import { PipesModule } from './../../pipes/pipes.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserStatusPage } from './user-status';

@NgModule({
  declarations: [
    UserStatusPage,
  ],
  imports: [
    IonicPageModule.forChild(UserStatusPage),
    PipesModule,
    OrderModule,
    ComponentsModule
  ],
})
export class UserStatusPageModule {}
