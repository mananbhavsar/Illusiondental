import { Component, ViewChild } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase';
import { Content, IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import * as _ from 'underscore';
import { ConnectionProvider } from '../../providers/connection/connection';
import { CaseStatusPage } from '../case-status/case-status';
import { CommunicationPage } from '../communication/communication';
import { InvoicePage } from '../invoice/invoice';
import { PaymentsPage } from '../payments/payments';
import { PickupPage } from '../pickup/pickup';





@IonicPage()
@Component({
  selector: 'page-office-list',
  templateUrl: 'office-list.html',
})
export class OfficeListPage {
  @ViewChild(Content) content: Content;
  hasInternet: boolean = true;

  showNoMoreOffices: boolean = false;
  readyForPagination: boolean = false;

  officeList: Array<any> = [];
  officeListIds: Array<any> = [];
  offlineOffices: any = {};

  searchText: string = '';

  page: string = null;
  pageNumber: number = 0;
  unReadCount: number = 0;

  newChatEventRefs: any = {};
  backDeregisterFunction: any = null;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public storage: Storage,
    public platform: Platform,
    private _network: Network,
    private connection: ConnectionProvider,
  ) {
    this.page = this.navParams.data.page;
  }

  ionViewDidLoad() {
    this.hasInternet = this._network.type !== 'none';
    this._network.onchange().subscribe(status => {
      this.hasInternet = this._network.type !== 'none';
    });

    this.searchText = '';
    this.initData();
  }

  ionViewDidEnter() {
    //listening to firebase event if list already present means on back
    if (this.officeList && this.officeList.length) {
      this.officeList.forEach(office => {
        this.listenToFirebaseEvent(office.CustomerBranchID);
      });
    }
  }

  ionViewWillLeave() {
    for (let key in this.newChatEventRefs) {
      this.newChatEventRefs[key].off('value');
      delete this.newChatEventRefs[key];
    }
  }

  initVariables() {
    this.pageNumber = 0;
    this.officeList = [];
    this.officeListIds = [];
    this.showNoMoreOffices = false;
    this.readyForPagination = false;
  }

  initData() {
    //re-init
    this.initVariables();

    this.storage.get('User').then(User => {
      if (User) {
        //checking if online
        if (this._network.type === 'none') {
          this.storage.get('OfflineOfficeList').then(officeList => {
            if (_.isEmpty(officeList)) {
              officeList = {};
            }
            //if not yet set for page
            if (!(this.page in officeList)) {
              officeList[this.page] = {};
            }
            //adding to list
            for (let officeId in officeList[this.page]) {
              this.pushItem(officeList[this.page][officeId], false);
            }
            //saveOffline
            this.offlineOffices = officeList;
            this.showNoMoreOffices = true;
          });
        } else {
          this.fetchData().then(response => {
            this.readyForPagination = true;
          }).catch(error => {
            this.readyForPagination = false;
          });
        }
      }
    });
  }

  fetchData() {
    return new Promise((resolve, reject) => {
      //make ajax call get offices
      this.connection.doPost('Account/GetUserOfficeList', {
        PageNumber: this.pageNumber,
        Page: this.page,
        filter: this.searchText
      }, this.searchText.length < 0).then((response: any) => {
        this.unReadCount = response.UnReadCount;
        if (response.OfficeList.length) {
          response.OfficeList.forEach(office => {
            this.pushItem(office);
          });
          this.pageNumber++;
          //save
          this.saveOfflineData().then(status => {
            resolve(status);
          }).catch(error => {
            reject(error);
          });
        } else {
          this.showNoMoreOffices = true;
          this.pageNumber = -1;
          reject(true);
        }
      }).catch(error => {
        setTimeout(() => {
          this.pageNumber = -1;
          reject(error);
        });
      });
    });
  }

  pushItem(item, addToOffline: boolean = true) {
    let id = item.CustomerBranchID;
    let index = this.getIndexOfOfficeId(id);

    if (index === -1) {//push
      index = this.officeList.push(item);
      //adding it to list
      this.officeListIds.push(id);
      //listen to Firebase event
      this.listenToFirebaseEvent(id);
    } else {//update
      this.officeList[index] = item;
    }

    if (addToOffline) {
      this.offlineOffices[id] = item;
    }
    return index;
  }

  getIndexOfOfficeId(id) {
    let index = -1;
    if (id) {
      index = this.officeListIds.indexOf(id);
      if (index === -1) {
        return index;
      }
      //verifying if its indeed right index
      if (this.officeList && this.officeList[index].CustomerBranchID !== id) {
        //looping to find
        let index = 0;
        this.officeList.forEach(item => {
          if (item.TicketNo === id) {
            return index;
          }
          index++;
        });
        //since not found
        index = -1;
      }
    }
    return index;
  }

  selectOffice(office) {
    let params = {
      selectedOffice: office,
      selectedCustomerBranchID: office.CustomerBranchID,
    };
    switch (this.page) {
      case 'Pickup':
        this.navCtrl.push(PickupPage, params);
        break;

      case 'Case Status':
        this.navCtrl.push(CaseStatusPage, params);
        break;

      case 'Communication':
        this.navCtrl.push(CommunicationPage, params);
        break;

      case 'Invoice':
        this.navCtrl.push(InvoicePage, params);
        break;

      case 'Payments':
        this.navCtrl.push(PaymentsPage, params);
        break;
    }
  }

  saveOfflineData() {
    return new Promise((resolve, reject) => {
      this.storage.get('OfflineOfficeList').then(officeList => {
        if (_.isEmpty(officeList)) {
          officeList = {};
        }
        //if not yet set for page
        if (!(this.page in officeList)) {
          officeList[this.page] = {};
        }
        officeList[this.page] = this.offlineOffices
        this.storage.set('OfflineOfficeList', officeList).then(status => {
          resolve(status);
        }).catch(error => {
          reject(error);
        });
      });
    });
  }

  getTrackByField(index, item) {
    return item.CustomerBranchID;
  }

  paginate(paginator) {
    this.fetchData().then(() => {
      paginator.complete();
      this.content.resize();
    }).catch((error) => {
      paginator.enable(false);
      this.content.resize();
    })
  }

  onSearchInput(event, loopedCounter: number = 0) {
    this.initVariables();
    this.fetchData().then(response => {
      this.readyForPagination = true;
    }).catch(error => {
      this.readyForPagination = false;
    });
  }

  listenToFirebaseEvent(id) {
    if (['Case Search', 'Communication'].indexOf(this.page) > -1) {
      let path = this.getFirebasePath(id);
      //checking if already present
      if (path && !(path in this.newChatEventRefs)) {

        let ref = firebase.database().ref(path);
        this.newChatEventRefs[path] = ref;

        //removing any existing
        ref.remove();

        //now listening to new
        ref.on('value', snapshop => {
          let count = snapshop.val();

          if (count !== null) {
            ref.remove();
            setTimeout(() => {
              let index = this.getIndexOfOfficeId(id);
              if (index > -1) {
                if (this.officeList[index].CustomerBranchID === id) {
                  this.officeList[index].Count = count;

                  this.offlineOffices[id] = this.officeList[index];

                  this.saveOfflineData().catch(error => {

                  });
                }
              }
            });
          }
        });
      }
    }
  }

  getFirebasePath(id) {
    let path = 'NewOfficeChatEvent/' + id + '/' + this.connection.user.id + '/';
    if (this.page === 'Case Search') {
      path += 'Communication_BranchCount';
    } else {
      path += 'Communication_BranchCount';
    }

    return path;
  }
}
