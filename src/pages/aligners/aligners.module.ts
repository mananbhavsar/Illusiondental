import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlignersPage } from './aligners';
import { OrderModule } from 'ngx-order-pipe';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    AlignersPage,
  ],
  imports: [
    IonicPageModule.forChild(AlignersPage),
    ComponentsModule,
    OrderModule,
  ],
})
export class AlignersPageModule {}
