import { Component, ViewChild } from '@angular/core';
import { Network } from '@ionic-native/network';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Storage } from '@ionic/storage';
import { TranslateService } from "@ngx-translate/core";
import { AlertController, Content, Events, IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'underscore';
import { Global } from "../../app/global";
import { ConnectionProvider } from "../../providers/connection/connection";
import { FirebaseTransactionProvider } from '../../providers/firebase-transaction/firebase-transaction';
import { OfflineStorageProvider } from '../../providers/offline-storage/offline-storage';
import { ChatPage } from "../chat/chat";
import { CaseStatusModalPage } from "./case-status-modal/case-status-modal";

@IonicPage()
@Component({
  selector: 'page-case-status',
  templateUrl: 'case-status.html'
})
export class CaseStatusPage {
  @ViewChild(Content) content: Content;
  title: string = 'loading';

  status = {
    'All': { label: 'All', color: 'danger' },
    'In Process': { label: 'In Process', color: 'danger' },
    'Job Delivered': { label: 'Ready To Deliver', color: 'danger' },
    'Job Dispatched': { label: 'Dispatched', color: 'secondary' }
  };
  selectedOffice: any = {};
  selectedCustomerBranchID: number = null;
  global: any = null;

  selectedTab = 'In Process';
  page: number = 0;

  items: any = [];
  itemImpressions = [];
  itemsSearchCopy: any = [];

  offlineItems: any = {};

  searchText: string = '';
  data: any = [];
  showSearchBar: boolean = true;
  loginType: number = 0;

  isAligner: boolean = false;
  patientCode: string = null;

  hasInternet: boolean = true;
  case_status_translated: string = 'Case Status';
  aligner_translated: string = 'Aligner';
  not_availble_in_offline_translate: string = 'Not available in Offline';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public connection: ConnectionProvider,
    public modalCtrl: ModalController,
    private _firebaseTransaction: FirebaseTransactionProvider,
    private _network: Network,
    private _storage: Storage,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private photoViewer: PhotoViewer,
    public alert: AlertController,
    private offlineStorage: OfflineStorageProvider,
  ) {
    this.selectedOffice = this.navParams.data.selectedOffice;
    this.selectedCustomerBranchID = this.navParams.data.selectedCustomerBranchID;

    //for aligner
    if ('patientCode' in this.navParams.data) {
      this.isAligner = true;
      this.patientCode = this.navParams.data.patientCode;
    }

    this.global = Global;
    this.loginType = this.connection.user.LoginTypeID;

    this.doNetworking();
  }

  doNetworking() {
    this.hasInternet = this._network.type !== 'none';
    this._network.onchange().subscribe(status => {
      this.hasInternet = this._network.type !== 'none';
    });
  }

  doTranslate() {
    //loading
    this.translate.get('Common._Loading_').subscribe(translated => {
      if (this.title === 'loading') {
        this.title = translated;
      }
    });
    //case staus
    this.translate.get('CaseStatus._CaseStatus').subscribe(translated => {
      this.case_status_translated = translated;
    });
    //aligner
    this.translate.get('HomeScreen._Aligners_').subscribe(translated => {
      // this.aligner_translated = translated;
    });
    //all
    this.translate.get('CaseStatus._All_').subscribe(translated => {
      this.status['All'].label = translated;
    });
    //In Process
    this.translate.get('CaseStatus._InProcess_').subscribe(translated => {
      this.status['In Process'].label = translated;
    });
    //Job Delivered
    this.translate.get('CaseStatus._ReadyToDeliver_').subscribe(translated => {
      this.status['Job Delivered'].label = translated;
    });
    //Job Dispatched
    this.translate.get('CaseStatus._Dispatched').subscribe(translated => {
      this.status['Job Dispatched'].label = translated;
    });
    //Not Available in Offline
    this.translate.get('ChatScreen._NotAvailableOffline_').subscribe(translated => {
      this.not_availble_in_offline_translate = translated;
    });
  }

  ionViewDidLoad() {
    this.doTranslate();
    if (!_.isEmpty(this.selectedOffice)) {

      this.setTitle();
      if (this._network.type === 'none') {
        this.initOffline();
      }
    }

    this.initData().then(response => { }).catch(error => {

    });
  }

  initData() {
    return new Promise((resolve, reject) => {
      if (this.hasInternet) {
        setTimeout(() => {
          let url = 'CaseSearch/CaseSearchBy';

          if (this.isAligner) {
            url = 'Aligners/CaseSearchBy';
          }
          this.connection.doPost(url, {
            JobEntryNo: null,
            ReferenceEntryNo: null,
            Patient: this.patientCode,
            BranchID: this.selectedCustomerBranchID,
            DoctorID: 0,
            Status: "",
            DisablePaging: false,
            PageNumber: this.page,
            RowsPerPage: 500,
            SortDetails: null,
            DateRange: null,
          }, this.items.length === 0).then((response: any) => {
            this.data = response.Data;
            for (let i = 0; i < this.data.length; i++) {
              this.pushItem(this.data[i], true);
            }
            this.saveOfflineData();

            if (response.Data) {
              this.page++;
            } else {
              this.page = -1;
            }
            //now doing firebase transaction
            this._firebaseTransaction.doTransaction(response.FireBaseTransaction).then(status => {
              resolve(this.data.length);
            }).catch(error => {
              resolve(this.data.length);
            });
          }).catch(error => {
            this.page = -1;
            reject(error);
          });
        });
      } else {
        reject(false);
      }
    });
  }

  segmentChanged(event) {
    this.selectedTab = event.value;
    this.setTitle();

    this.scrollToTop();
  }

  setTitle() {
    this.title = this.case_status_translated + ': ' + this.status[this.selectedTab].label;
    //for aligner
    if (this.isAligner) {
      this.title = this.aligner_translated + ' Cases: ' + this.status[this.selectedTab].label;
    }
  }

  scrollToTop() {
    setTimeout(() => {
      if (this.content.resize) {
        this.content.resize();
      }
      if (this.content.scrollToTop) {
        this.content.scrollToTop();
      }
    });
  }

  getStatusColor(status) {
    return this.status[status].color;
  }

  getStatusLabel(status) {
    return this.status[status].label;
  }

  doInfinite(paginator) {
    if (this.hasInternet) {
      this.initData().then((response) => {
        paginator.complete();
      }).catch((error) => {
        paginator.enable(false);
      })
    } else {
      paginator.enable(false);
      this.events.subscribe('network:online', () => {
        if (paginator) {
          paginator.enable(true);
        }
      });
    }
  }

  onCancel(event) {
    this.items = this.itemsSearchCopy;
  }

  isHidden(status) {
    if (this.selectedTab === 'All') {
      return false;
    }
    return status !== this.selectedTab
  }

  openCase(item, index) {
    try {
      item = JSON.parse(JSON.stringify(item));
    } catch (e) {

    }

    if (this._network.type === 'none') {
      this.events.publish('toast:error', this.not_availble_in_offline_translate);
    } else {
      this.setIsNew(item, index);
      let modal = this.modalCtrl.create(CaseStatusModalPage, {
        item: item,
        isAligner: this.isAligner
      });
      modal.onDidDismiss(data => {

      });
      modal.present();
    }

  }

  getItems(searchText) {
    const fields = ['Doctor', 'ImpressionNo', 'ReferenceEntryNo', 'Patient'];
    // Reset items back to all of the items
    this.items = this.itemsSearchCopy;

    // if the value is an empty string don't filter the items
    if (searchText && searchText.trim() != '') {
      //lowercase 
      searchText = searchText.toLowerCase();
      this.items = this.items.filter((item) => {
        for (let i = 0; i < fields.length; i++) {
          if (item[fields[i]].toLowerCase().indexOf(searchText) > -1) {
            return true;
          }
        }
        return false;
      });
    }
  }

  headerButtonClicked(event) {
    if (event.icon === 'search') {
      this.showSearchBar = !this.showSearchBar;
      this.scrollToTop();
      this.selectedTab = 'All';
    }
  }

  pushItem(item, addToOffline: boolean = true) {
    //converting impressDate to timeinmili
    item['ImpressionDateInMili'] = new Date(item.ImpressionDateTime).getTime();

    let impressionNo = item.ImpressionNo;
    let index = this.itemImpressions.indexOf(impressionNo);
    if (index === -1) {
      index = this.items.push(item);
      //making copy for search
      this.itemsSearchCopy.push(item);
      //adding impression
      this.itemImpressions.push(impressionNo);
    } else {
      this.items[index] = item;
      //making copy for search
      this.itemsSearchCopy[index] = item;
    }
    //adding to Offline
    if (addToOffline) {
      this.addToOffline(item);
    }
    return index;
  }

  initOffline() {
    return new Promise((resolve, reject) => {
      this.offlineStorage.getCase('OfflineCaseStatus', this.selectedCustomerBranchID).then(caseStatus => {
        this.offlineItems = caseStatus;

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

  addToOffline(item) {
    this.offlineItems[item.ImpressionNo] = item;
  }

  saveOfflineData() {
    return this.offlineStorage.setCase('OfflineCaseStatus', this.selectedCustomerBranchID, this.offlineItems);
  }

  setIsNew(item, index) {
    return new Promise((resolve, reject) => {
      if (item.IsNew) {
        item.IsNew = 0;
        this.items[index].IsNew = 0;
        this.offlineItems[item.ImpressionNo].IsNew = 0;

        this.saveOfflineData().then(status => {
          resolve(status);
        }).catch(error => {
          reject(error);
        });
      } else {
        resolve(true);
      }
    });
  }

  openChat(item, index, event) {
    //stopping propogaton
    event.preventDefault();
    event.stopPropagation();

    let chatParams = item.TicketNo;
    if (Global.work_with_impression_no) {
      chatParams = {
        ImpressionNo: item.ImpressionNo,
        TicketNo: item.TicketNo
      }
    }
    if (item.TicketNo) {
      this.navCtrl.push(ChatPage, chatParams);
    } else {
      //checking if offline
      if (this.hasInternet) {
        let alert = this.alertCtrl.create({
          title: 'Alert',
          message: item.PopupMessage,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {

              }
            },
            {
              text: 'Ok',
              handler: () => {

                this.connection.doPost('Communication/InitiateChat', {
                  ImpNo: item.ImpressionNo
                }, true).then((response: any) => {
                  let data = response.Data[0];
                  item.TicketNo = data.TicketNo;
                  this.items[index].TicketNo = data.TicketNo;

                  let chatParams = item.TicketNo;
                  if (Global.work_with_impression_no) {
                    chatParams = {
                      ImpressionNo: item.ImpressionNo,
                      TicketNo: item.TicketNo
                    }
                  }

                  this._firebaseTransaction.doTransaction(response.FireBaseTransaction).then(status => {
                    this.navCtrl.push(ChatPage, chatParams);
                  }).catch(error => {
                    if (error === 'Empty') {
                      this.navCtrl.push(ChatPage, chatParams);
                    }
                  });
                }).catch(error => {

                });
              }
            }
          ]
        });
        alert.present();
      } else {
        this.events.publish('toast:error', this.not_availble_in_offline_translate);
      }
    }
  }

  openRx(item, index, event) {
    event.preventDefault();
    event.stopPropagation();

    if (item.Rx && item.Rx !== '') {
      let url = item.Rx + '?v=' + (new Date().getTime());
      this.photoViewer.show(url, 'Rx', { share: false });
    } else {
      this.events.publish('alert:basic', 'Rx not found!', 'Need message here');
    }
  }

  openFeedbackForm(item, event) {
    event.preventDefault();
    event.stopPropagation();
    let modal = this.modalCtrl.create('FeedbackPage', item);
    modal.onDidDismiss(data => {
      if (data) {
        item.Feedback_Given = 'Yes';
      }
    });
    modal.present();
  }

  isFeedbackVisible(item) {
    if (item.Substatus === 'Job Dispatched') {
      if (item.Feedback_Given === 'Yes') {
        return true;
      }
      return [this.global.LoginType.Doctor, this.global.LoginType.Parent].indexOf(this.loginType) > -1
    }
    return false;
  }

}
