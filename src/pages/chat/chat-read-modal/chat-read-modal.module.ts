import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatReadModalPage } from './chat-read-modal';
import { ComponentsModule } from "../../../components/components.module";
import { PipesModule } from "../../../pipes/pipes.module";
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    ChatReadModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatReadModalPage),
    ComponentsModule,
    PipesModule,
    OrderModule,
  ],
})
export class ChatReadModalPageModule { }
