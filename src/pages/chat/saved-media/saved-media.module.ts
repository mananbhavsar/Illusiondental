import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SavedMediaPage } from './saved-media';
import { ComponentsModule } from "../../../components/components.module";
import { PipesModule } from "../../../pipes/pipes.module";
import { OrderModule } from 'ngx-order-pipe';
@NgModule({
  declarations: [
    SavedMediaPage,
  ],
  imports: [
    IonicPageModule.forChild(SavedMediaPage),
    ComponentsModule,
    PipesModule,
    OrderModule,
  ],
})
export class SavedMediaPageModule {}
