import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-user-status',
  templateUrl: 'user-status.html',
})
export class UserStatusPage {
  data : any = [];
  constructor(public navCtrl: NavController,public viewCtrl : ViewController, public navParams: NavParams) {
  
    this.data = this.navParams.data;

  }

  dismiss(data){
    this.viewCtrl.dismiss();
  }

}
