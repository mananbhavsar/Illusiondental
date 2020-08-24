import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Global } from '../../app/global';

/**
 * Generated class for the HelpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {
  global: any = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
  ) {
    this.global = Global;
  }

  ionViewDidLoad() {
    
  }

}
