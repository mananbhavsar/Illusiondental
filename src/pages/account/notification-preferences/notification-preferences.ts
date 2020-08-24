import { Component } from '@angular/core';
import { IonicPage, Events, NavController, NavParams, ViewController } from 'ionic-angular';

import { UserProvider } from '../../../providers/user/user';
import { ConnectionProvider } from '../../../providers/connection/connection';

import { Network } from '@ionic-native/network';

import { Global } from '../../../app/global';

@IonicPage()
@Component({
  selector: 'page-notification-preferences',
  templateUrl: 'notification-preferences.html',
})
export class NotificationPreferencesPage {
  data: any = {};
  submitted = false;
  global: any = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewController: ViewController,
    public user: UserProvider,
    public connection: ConnectionProvider,
    public events: Events,
    private network: Network,
  ) {
    this.global = Global;
  }

  ionViewDidLoad() {
    //checking if offline
    if (this.network.type === 'none') {
      this.dismiss('Not available in Offline');
    } else {
      //getting profile data from server
      this.getData();
    }
  }

  getData() {
    this.connection.doPost('MobileApp/GetUserProfile').then(response => {
      this.data = response[0];
    }).catch(error => {
      this.dismiss(error);
    });
  }

  update() {
    //prevent dublicate submit
    if (this.submitted) {
      return false;
    }
    this.submitted = true;
    //updating
    this.connection.doPost('MobileApp/UserProfile_AlertPreference', {
      Alert_Pickup: this.data.Alert_Pickup,
      Alert_Dispatch: this.data.Alert_Dispatch,
      Alert_Communication: this.data.Alert_Communication,
    }, 'updating').then((response: any) => {
      if (response.Status) {
        this.events.publish('toast:create', response.Message);
        this.dismiss(response);
      } else {
        this.submitted = false;
        this.events.publish('toast:error', response.Message);
      }
    }).catch(error => {
      this.submitted = false;
    });
  }

  dismiss(data) {
    this.viewController.dismiss(data);
  }

}
