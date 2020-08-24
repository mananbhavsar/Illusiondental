import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ConnectionProvider } from './../../providers/connection/connection';

@IonicPage()
@Component({
  selector: 'page-disclaimer',
  templateUrl: 'disclaimer.html',
})
export class DisclaimerPage {
  data: string = null;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public _connection: ConnectionProvider) {

  }

  ionViewDidLoad() {
    this.getData();
  }


  getData() {
    return new Promise((resolve, reject) => {
      this._connection.doPost('Dashboard/GetDisclaimer', {
      }).then((response: any) => {
        this.data = response;
        resolve(true);
      }).catch((error) => {

      });
    });
  }

}
