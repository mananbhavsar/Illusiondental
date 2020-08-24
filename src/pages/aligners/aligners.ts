import { Component, ViewChild } from '@angular/core';
import { Network } from '@ionic-native/network';
import { TranslateService } from "@ngx-translate/core";
import { Content, Events, IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'underscore';
import { Global } from "../../app/global";
import { ConnectionProvider } from "../../providers/connection/connection";
import { FirebaseTransactionProvider } from '../../providers/firebase-transaction/firebase-transaction';
import { OfflineStorageProvider } from '../../providers/offline-storage/offline-storage';

@IonicPage()
@Component({
  selector: 'page-aligners',
  templateUrl: 'aligners.html',
})
export class AlignersPage {
  @ViewChild(Content) content: Content;
  title: String = 'loading';

  selectedOffice: any = {};
  selectedCustomerBranchID: number = null;
  global: any = null;

  page: number = 0;

  patients: any = [];
  patientsCodes: any = [];
  patientsSearchCopy: any = [];

  offlinePatients: any = {};

  searchText: string = '';
  showSearchBar: boolean = true;

  hasInternet: boolean = true;
  aligner: string = 'Aligner';
  not_availble_in_offline_translate: string = 'Not available in Offline';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public connection: ConnectionProvider,
    public modalCtrl: ModalController,
    private _firebaseTransaction: FirebaseTransactionProvider,
    private _network: Network,
    private translate: TranslateService,
    private offlineStorage: OfflineStorageProvider,
  ) {
    this.selectedOffice = this.navParams.data.selectedOffice;
    this.selectedCustomerBranchID = this.navParams.data.selectedCustomerBranchID;

    this.global = Global;

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
    this.translate.get('HomeScreen._Aligners_').subscribe(translated => {
      this.aligner = translated;
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

  setTitle() {
    this.title = this.aligner;
  }

  initOffline() {
    return new Promise((resolve, reject) => {
      this.offlineStorage.getCase('OfflineAligners', this.selectedCustomerBranchID).then(aligner => {
        //offline 
        this.offlinePatients = aligner
        //init List
        for (let key in this.offlinePatients.patients) {
          this.pushItem(this.offlinePatients.patients[key], false);
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

  setIfEmpty(aligner, setOffline) {
    if (_.isEmpty(aligner)) {
      aligner = {};
    }
    //checking if this office is set
    if (!(this.selectedCustomerBranchID in aligner)) {
      aligner[this.selectedCustomerBranchID] = {
        patients: {},
        cases: {}
      };
    }
    if (setOffline) {
      this.offlinePatients = aligner[this.selectedCustomerBranchID];
    }
    return aligner;
  }

  pushItem(item, addToOffline: boolean = true) {
    let patientCode = item.Patient;
    let index = this.patientsCodes.indexOf(patientCode);
    if (index === -1) {
      index = this.patients.push(item);
      //making copy for search
      this.patientsSearchCopy.push(item);
      //adding code
      this.patientsCodes.push(patientCode);
    } else {
      this.patients[index] = item;
      //making copy for search
      this.patientsSearchCopy[index] = item;
    }
    //adding to Offline
    if (addToOffline) {
      this.addToOffline(item);
    }
    return index;
  }

  addToOffline(item) {
    if (_.isEmpty(this.offlinePatients)) {
      this.offlinePatients = {
        patients: {},
        cases: {}
      };
    }
    this.offlinePatients.patients[item.Patient] = item;
  }

  saveOfflineData() {
    return this.offlineStorage.setCase('OfflineAligners', this.selectedCustomerBranchID, this.offlinePatients);
  }

  initData() {
    return new Promise((resolve, reject) => {
      if (this.hasInternet) {
        setTimeout(() => {
          this.connection.doPost('Aligners/GetPatientList', {
            JobEntryNo: null,
            ReferenceEntryNo: null,
            Patient: null,
            BranchID: this.selectedCustomerBranchID,
            DoctorID: 0,
            DisablePaging: false,
            PageNumber: this.page,
            RowsPerPage: 500,
            SortDetails: null,
            DateRange: null
          }, this.patients.length === 0).then((response: any) => {
            let data = response.PatientList;

            for (let i = 0; i < data.length; i++) {
              this.pushItem(data[i], true);
            }

            this.saveOfflineData();
            if (data.length) {
              this.page++;
            } else {
              this.page = -1;
            }
            //now doing firebase transaction
            this._firebaseTransaction.doTransaction(response.FireBaseTransaction).then(status => {
              resolve(data.length);
            }).catch(error => {
              resolve(data.length);
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

  headerButtonClicked(event) {
    if (event.icon === 'search') {
      this.showSearchBar = !this.showSearchBar;
      this.scrollToTop();
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

  openPatientCase(patient, index) {
    this.navCtrl.push('CaseStatusPage', {
      selectedOffice: this.selectedOffice,
      selectedCustomerBranchID: this.selectedCustomerBranchID,
      patientCode: patient.Patient,
    });
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
    this.patients = this.patientsSearchCopy;
  }

  getItems(searchText) {
    const field = 'Patient';
    // Reset items back to all of the items
    this.patients = this.patientsSearchCopy;

    // if the value is an empty string don't filter the items
    if (searchText && searchText.trim() != '') {
      //lowercase 
      searchText = searchText.toLowerCase();
      this.patients = this.patients.filter((item) => {
        if (item[field].toLowerCase().indexOf(searchText) > -1) {
          return true;
        }
        return false;
      });
    }
  }
}
