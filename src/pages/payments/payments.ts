import { Component } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { TranslateService } from "@ngx-translate/core";
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import * as _ from 'underscore';
import { Global } from "../../app/global";
import { ConnectionProvider } from "../../providers/connection/connection";
import { FileOpsProvider } from "../../providers/file-ops/file-ops";


@IonicPage()
@Component({
  selector: 'page-payments',
  templateUrl: 'payments.html',
})
export class PaymentsPage {
  items: any = [];
  itemPayments: any = [];
  offlineItems: any = {};

  loginType: number = 0;
  selectedOffice: any = {};
  selectedCustomerBranchID: string = null;
  global: any = null;

  dataDirectory: string = null;
  downloadDirectory: string = null;

  hasInternet: boolean = true;
  loading: String = 'loading';
  title: string = 'Payments';
  payment_translate: string = 'Payments';
  not_availble_in_offline_translate: string = 'Not available in Offline';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public connection: ConnectionProvider,
    private _network: Network,
    private _storage: Storage,
    private translate: TranslateService,
    private _fileOps: FileOpsProvider,
  ) {
    this.global = Global;
    this.loginType = this.connection.user.LoginTypeID;

    this.hasInternet = this._network.type !== 'none';
    this.selectedOffice = this.navParams.data.selectedOffice;
    this.selectedCustomerBranchID = this.navParams.data.selectedCustomerBranchID;
  }

  doTranslate() {
    //loading
    this.translate.get('Common._Loading_').subscribe(translated => {
      this.loading = translated;
    });
    //title
    this.translate.get('HomeScreen._Payments_').subscribe(translated => {
      this.payment_translate = translated;
      this.setTitle();
    });
    //Not Available in Offline
    this.translate.get('ChatScreen._NotAvailableOffline_').subscribe(translated => {
      this.not_availble_in_offline_translate = translated;
    });
  }

  ionViewCanEnter() {
    this.doTranslate();
    if (this._network.type === 'none') {
      this.events.publish('toast:error', this.not_availble_in_offline_translate);
    }
    return this._network.type !== 'none';
  }

  ionViewDidEnter() {
    this.doTranslate();
    if (!_.isEmpty(this.selectedOffice)) {

      //creating folder
      this._fileOps.getDataDirectory().then((path: string) => {
        this.dataDirectory = path;

        this.downloadDirectory = this.dataDirectory + 'payments/';
        this._fileOps.createDirectoryIfNotExist(this.dataDirectory, 'payments');
      }).catch(error => {
      
      });

      this.setTitle();
      this.initOffline();

      this.initData().then(response => { }).catch(error => {
   
      });

    }
  }

  setTitle() {
    this.title = this.payment_translate;
  }

  initData() {
    return new Promise((resolve, reject) => {
      if (this.hasInternet) {
        setTimeout(() => {
          this.connection.doPost('MobileApp/GetPaymentDetails', {
            BranchID: this.selectedCustomerBranchID,
          }, this.items.length === 0).then((response: any) => {
            let data = response;
   
            for (let i = 0; i < data.length; i++) {
              this.pushItem(data[i], true);
            }
            this.saveOfflineData();
          }).catch(error => {
            reject(error);
          });
        });
      } else {
        reject(false);
      }
    });
  }

  initOffline() {
    return new Promise((resolve, reject) => {
      this._storage.get('OfflinePayments').then(payments => {
        if (_.isEmpty(payments)) {
          payments = {};
        }
        //checking if this office is set
        if (!(this.selectedCustomerBranchID in payments)) {
          payments[this.selectedCustomerBranchID] = {};
        }
        this.offlineItems = payments[this.selectedCustomerBranchID];

        //init List
        for (let key in this.offlineItems) {
          this.pushItem(this.offlineItems[key], false);
        }
        //saveOffline
        this.saveOfflineData().then(status => {
          resolve(status);
        }).catch(error => {
          reject(error);
        })
      }).catch(error => {
        reject(error);
      });
    });
  }

  pushItem(item, addToOffline: boolean = true) {
    //converting impressDate to timeinmili
    item['ReceiptDateInMili'] = new Date(item.ReceiptDate).getTime();

    let ReceiptNo = item.ReceiptNo;
    let index = this.itemPayments.indexOf(ReceiptNo);
    if (index === -1) {
      index = this.items.push(item);
      //adding impression
      this.itemPayments.push(ReceiptNo);
    } else {
      this.items[index] = item;
    }
    //adding to Offline
    if (addToOffline) {
      this.addToOffline(item);
    }
    return index;
  }

  addToOffline(item) {
    this.offlineItems[item.ReceiptNo] = item;
  }

  saveOfflineData() {
    return new Promise((resolve, reject) => {
      this._storage.get('OfflinePayments').then(payments => {
        if (_.isEmpty(payments)) {
          payments = {};
        }
        //checking if this office is set
        if (!(this.selectedCustomerBranchID in payments)) {
          payments[this.selectedCustomerBranchID] = {};
        }
        payments[this.selectedCustomerBranchID] = this.offlineItems;

        this._storage.set('OfflinePayments', payments).then(status => {
          resolve(status);
        }).catch(error => {
          reject(error);
        });
      })
    });
  }

}