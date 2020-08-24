import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Events, ModalController } from 'ionic-angular';
import * as _ from 'underscore';
import { OfficeListPage } from "../../pages/office-list/office-list";





@Injectable()
export class OfficeServiceProvider {
  officeList: Array<any> = [];
  loadingOfficeList: Boolean = true;
  isMultipleOffice: boolean | -1 = -1;

  pickupSelectedOffice: any = null;
  caseStatusSelectedOffice: any = null;
  communicationSelectedOffice: any = null;
  invoiceSelectedOffice: any = null;
  paymentsSelectedOffice: any = null;
  alignersSelectedOffice: any = null;

  user: any = {};

  office_list_unavailable_translate: string = 'No Office/Branch is asigned to you. Kindly contact Admin';
  failed_to_load_translate: string = 'Failed to load Office list';
  loading_translate: string = 'loading';
  constructor(
    public storage: Storage,
    public events: Events,
    public modalCtrl: ModalController,
    private _network: Network,
    private translate: TranslateService,
  ) {
    //setting user ID
    this.setUser().catch(error => { });

    //set if user has Single office (if singleset then set)
    this.events.subscribe('officeList:set', (officeList) => {
      this.setUser().then(status => {
        //getting Office List
        this.loadOfficeList(officeList).then(status => {
          this.events.publish('officeList:loaded', true);
        }).catch(error => {
          this.events.publish('officeList:loaded', true);
        });
      }).catch(error => { });
    });

    //on Logout clearing office list
    this.events.subscribe('user:postLogout', () => {
      this.reset();
    });

    //from menu to event page with OfficeList
    this.events.subscribe('officeList:open', (page, pageName) => {
      this.openOfficeListThenPage(page, pageName);
    });

  }

  doTranslate() {
    //unavailable
    this.translate.get('OfficeList._OfficeListUnavailable_').subscribe(translated => {
      this.office_list_unavailable_translate = translated;
    });
    //failed to load
    this.translate.get('OfficeList._FailedToLoad_').subscribe(translated => {
      this.failed_to_load_translate = translated;
    });
    //loading
    this.translate.get('Common._Loading_').subscribe(translated => {
      this.loading_translate = translated;
    });
  }

  reset() {
    this.officeList = [];
    this.loadingOfficeList = true;
    this.isMultipleOffice = -1;
  }

  setUser() {
    return new Promise((resolve, reject) => {
      this.storage.get('User').then(User => {
        this.user = User;
        resolve(true);
      }).catch(error => {
        reject();
      });
    });
  }

  loadOfficeList(offices) {
    return new Promise((resolve, reject) => {
      this.doTranslate();
      this.loadingOfficeList = true;
      //checking if has internet
      if (this._network.type === 'none') { //offline
        this.storage.get('OfflineOfficeList').then(officeList => {
          this.officeList = officeList;
          this.loadingOfficeList = false;

          this.setMultiOffice().then(status => {
            resolve(status);
          }).catch(status => {
            reject(status);
          });
        })
      } else { //online
        //checking if null passed and user has single office
        if (offices === null)
          if (this.user.SingleOffice) {
            offices = [{
              CustomerBranchID: this.user.CustomerBranchID,
              CustomerName: this.user.CustomerName
            }];
          } else {
            offices = [1, 2];
          }
        this.officeList = offices;
        this.storage.set('OfflineOfficeList', this.officeList);
        this.loadingOfficeList = false;

        this.setMultiOffice().then(status => {
          resolve(status);
        }).catch(status => {
          reject(status);
        });
      }
    })
  }

  /**
   * returns true if more than one Office is assigned
   */
  isMultiOffice() {
    return this.isMultipleOffice;
  }

  setMultiOffice() {
    return new Promise((resolve, reject) => {
      if (_.size(this.officeList) > 0) {
        this.isMultipleOffice = _.size(this.officeList) > 1;
        resolve(true);
      } else {
        this.isMultipleOffice = -1;
        reject(false);
      }
    });
  }
  /**
   * returns selected Office or open Modal to selects on
   * @param type PageType
   * return this will return
   * -1 if no data found from server
   * office object, if selected
   * null, if nothing selected and closed
   */
  getOffice(type) {
    return new Promise((resolve, reject) => {
      //deselecting office list for page
      this.setSelectedOffice(type, null);

      this.isOfficeListLoaded().then(() => {

        //checking for number of office
        let multiOfficeFlag = this.isMultiOffice();
        if (multiOfficeFlag === true) {//more than one office. Need to select one
          //open Office List Modal
          let officeListModal = this.modalCtrl.create(OfficeListPage, {
            modelFlagName: type
          });
          officeListModal.onDidDismiss((selectedOffice) => {
            if (selectedOffice === null) {
              reject(null);
            } else {
              this.setSelectedOffice(type, selectedOffice);
              resolve(selectedOffice);
            }
          });
          officeListModal.present();
        } else if (multiOfficeFlag === false) { //just one office
          let first = this.getFirstOffice();
          resolve(first);
        } else { //no office
          reject(this.office_list_unavailable_translate);
        }
      }).catch((message) => {
        reject(message);
      });

    });
  }

  getFirstOffice() {
    return this.officeList[Object.keys(this.officeList)[0]];
  }

  isOfficeListLoaded() {
    return new Promise((resolve, reject) => {
      //not loaded yet. Show loading and wait to load
      if (this.loadingOfficeList) {
        //showing loading
        this.events.publish('loading:create', this.loading_translate);
        //setting timeout of 10 secs to reload
        setTimeout(() => {
          if (this.loadingOfficeList) {//still loading
            this.events.publish('loading:close');
            //trying to load again
            this.loadOfficeList(null).then(status => {
              resolve(status);
            }).catch(error => {
              reject('Failed to load. Try again');
            });
          }
        }, 3000);
        //subscribing to event
        this.events.subscribe('officeList:loaded', (status) => {
          //closing office list
          this.events.publish('loading:close');
          //sending message
          if (status) {
            resolve(true);
          } else {
            reject(this.failed_to_load_translate);
          }
        });
      } else {
        if (_.isEmpty(this.officeList) || _.size(this.officeList) === 0) {
          //checking if it has offices or we will try to load again before moving back
          this.loadOfficeList(null).then(status => {
            resolve(true);
          }).catch(status => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      }
    });
  }

  setSelectedOffice(page, data) {
    switch (page) {
      case 'Pickup':
        this.pickupSelectedOffice = data;
        break;

      case 'Case Status':
        this.caseStatusSelectedOffice = data;
        break;

      case 'Communication':
        this.communicationSelectedOffice = data;
        break;

      case 'Invoice':
        this.invoiceSelectedOffice = data;
        break;

      case 'Payments':
        this.paymentsSelectedOffice = data;
        break;

      case 'Aligners':
        this.alignersSelectedOffice = data;
        break;
    }
  }

  openOfficeListThenPage(page, pageName) {
    this.isOfficeListLoaded().then(status => {
      //checking if multi office or single
      if (this.isMultiOffice()) {
        this.events.publish('page:open', OfficeListPage, {
          page: pageName
        });
      } else {
        let firstOffice = this.getFirstOffice();
        if (firstOffice) {
          this.events.publish('page:open', page, {
            selectedOffice: firstOffice,
            selectedCustomerBranchID: firstOffice.CustomerBranchID
          });
        }
      }
    }).catch(error => {
      this.events.publish('toast:error', error);
    })
  }

}