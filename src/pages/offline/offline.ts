import { Component } from '@angular/core';
import { Network } from '@ionic-native/network';
import { IonicPage, NavController } from 'ionic-angular';
import { WelcomePage } from "../welcome/welcome";

@IonicPage()
@Component({
  selector: 'page-offline',
  templateUrl: 'offline.html',
})
export class OfflinePage {
  constructor(
    public network: Network,
    public navCtrl: NavController,
  ) {
  }

  ionViewDidLoad() {

  }

  checkForInternet(refresher) {
    if (this.network.type === 'none') {
    }else{
      this.navCtrl.setRoot(WelcomePage)
    }
    if (refresher) {
      refresher.complete();
    }
  }

}
