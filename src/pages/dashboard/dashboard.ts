import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as _ from 'underscore';
import { ConnectionProvider } from "../../providers/connection/connection";


@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html',
})
export class DashboardPage {
  dashboardData: any = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private connection: ConnectionProvider,
    private _storage: Storage,
  ) {
  }

  ionViewDidEnter() {
    this._storage.get('OfflineDashboard').then(dashboard => {
      let loader = true;
      if (!_.isEmpty(dashboard)) {
        loader = false;
        this.dashboardData = dashboard.data;
      }
      this.initData(null, loader);
    });
  }

  initData(refresher, loader: boolean = true) {
    this.connection.doPost('Dashboard/GetDashboardData', {}, loader).then(response => {
      this.dashboardData = response;
      //adding to offline

      this._storage.set('OfflineDashboard', {
        data: response,
        timestamp: new Date().getTime()
      });
      if (refresher) {
        refresher.complete();
      }
    }).catch(error => {
      if (refresher) {
        refresher.complete();
      }
    });
  }

  roundUp(number, precision: number = 2) {
    if (isNaN(number)) {
      return number;
    }
    return parseFloat(number+'').toFixed(precision);
  }

}
