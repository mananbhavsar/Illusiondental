import { Component } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { Events, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import * as _ from 'underscore';
import { Global } from "../../../app/global";
import { ConnectionProvider } from "../../../providers/connection/connection";



@IonicPage()
@Component({
  selector: 'page-case-status-modal',
  templateUrl: 'case-status-modal.html',
})
export class CaseStatusModalPage {
  title: String = 'loading';
  item: any = {};
  impressNo: string = null;
  challans: Array<any> = [];
  global: any = Global;
  product: any = [];
  challanVisible: boolean = false;
  hasInternet: boolean = true;
  _: _.UnderscoreStatic = _;
  offline_translate: string = 'You seems to be offline';

  isAligner: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private _callNumber: CallNumber,
    private _network: Network,
    private _storage: Storage,
    private _inAppBrowser: InAppBrowser,
    private _connection: ConnectionProvider,
    private _events: Events
  ) {
    this.item = this.navParams.data.item;
    this.isAligner = this.navParams.data.isAligner;

    this.impressNo = this.item.ImpressionNo;
    this.title = this.item.Patient;
    this.hasInternet = this._network.type !== 'none';
  }

  ionViewDidEnter() {
    this.doTranslate();
    if (this._network.type === 'none') {
      this._events.publish('toast:error', this.offline_translate);
    } else {
      this.challanVisible = this._connection.user.isPortalAdmin && [Global.LoginType.Doctor, Global.LoginType.Parent].indexOf(this._connection.user.LoginTypeID) > -1;
      this.getProductInfo();
    }

  }

  getProductInfo() {
    if (this.hasInternet) {
      this._connection.doPost('MobileApp/GetProductDetails', {
        ImpressionNumber: this.impressNo
      }).then((response: Array<any>) => {
        this.product = response;
        //saving Offline
        this.getOfflineProduct().then(product => {
          product[this.impressNo] = this.product;
          this._storage.set('OfflineProduct', product);
        }).catch(error => { });
      }).catch(error => {

      });
    } else {
      this.getOfflineProduct().then(product => {
        this.product = product[this.impressNo];
        this.product = product;
      }).catch(error => {

      });
    }
  }

  getOfflineProduct() {
    return new Promise((resolve, reject) => {
      this._storage.get('OfflineProduct').then(product => {
        //checking if empty
        if (_.isEmpty(product)) {
          product = {};
        }
        if (!(this.impressNo in product)) {
          product[this.impressNo] = [];
        }
        resolve(product);
      }).catch(error => {
        reject(error);
      });
    });
  }


  doTranslate() {

  }

  dismiss(data) {
    this.viewCtrl.dismiss();
  }

  callNumber(number) {
    this._callNumber.callNumber(number, true);
  }

  openURL(url) {
    if (url.trim() !== '') {
      this._inAppBrowser.create(url);
    }
  }

  starClicked(value) {

  }

}
