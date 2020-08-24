import { Component, ViewChild } from '@angular/core';
import { Network } from '@ionic-native/network';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Storage } from '@ionic/storage';
import { TranslateService } from "@ngx-translate/core";
import * as firebase from 'firebase';
import { AlertController, Content, Events, IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import * as _ from 'underscore';
import { Global } from '../../app/global';
import { ConnectionProvider } from "../../providers/connection/connection";
import { ChatPage } from "../chat/chat";





@IonicPage()
@Component({
  selector: 'page-communication',
  templateUrl: 'communication.html',
})
export class CommunicationPage {
  @ViewChild(Content) content: Content;
  title: String = 'loading';
  titles = { 'Today': '', 'Pending': '', 'All': '' };
  status = {
    'Resolved': { label: 'Resolved', color: 'secondary' },
    'Pending': { label: 'Pending', color: 'danger' },
  };
  selectedOffice: any = {};
  selectedCustomerBranchID: number = null;

  queries_text: string = '';
  selectedTab = 'All';
  page: number = 0;

  items: any = [];
  itemsTicketNo: any = [];
  itemsSearchCopy: any = [];

  offlineItems: any = {};

  searchText: string = '';
  showSearchBar: boolean = true;
  openingChat: boolean = false;

  newChatEventRefs: Object = {};
  newQueryEventRefs: Object = {};

  hasInternet: boolean = true;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public connection: ConnectionProvider,
    public platform: Platform,
    private _network: Network,
    private _storage: Storage,
    private translate: TranslateService,
    private photoViewer: PhotoViewer,
    public alert : AlertController
  ) {
    this.selectedOffice = this.navParams.data.selectedOffice;
    this.selectedCustomerBranchID = this.navParams.data.selectedCustomerBranchID;

    this.hasInternet = this._network.type !== 'none';
    this.events.subscribe('network:online', () => {
      this.hasInternet = true;
    });
    this.events.subscribe('network:offline', () => {
      this.hasInternet = false;
    });
  }

  doTranslate() {
    //Queries
    this.translate.get('CommunicationPage._Queries_').subscribe(translated => {
      this.queries_text = translated;
    });
    //loading
    this.translate.get('Common._Loading_').subscribe(translated => {
      if (this.title === 'loading') {
        this.title = translated;
      }
    });
    //today
    this.translate.get('CommunicationPage._Today_').subscribe(translated => {
      this.titles.Today = translated;
    });
    //Pending
    this.translate.get('CommunicationPage._Pending_').subscribe(translated => {
      this.titles.Pending = translated;
      this.status.Pending.label = translated;
    });
    //All
    this.translate.get('CommunicationPage._All_').subscribe(translated => {
      this.titles.All = translated;
    });
    //Resolved
    this.translate.get('CommunicationPage._Resolved').subscribe(translated => {
      this.status.Resolved.label = translated;
    });
  }

  ionViewDidLoad() {
    this.doTranslate();
    if (!_.isEmpty(this.selectedOffice)) {
      this.setTitle();
      if (this._network.type === 'none') {
        this.initOffline();
      } else {
        this.initData().then(response => { }).catch(error => {

        });
        this.listenToFirebaseQueryEvent();
      }
    } else {

    }
  }

  ionViewDidEnter() {
    //listening to firebase event if list already present means on back
    if (this.items && this.items.length) {
      this.items.forEach(item => {
        this.listenToFirebaseChatEvent(item);
      });
      this.listenToFirebaseQueryEvent();
    }
  }

  initOffline() {
    return new Promise((resolve, reject) => {
      this._storage.get('OfflineQuery').then(queries => {
        if (_.isEmpty(queries)) {
          queries = {};
        }
        //checking if this office is set
        if (!(this.selectedCustomerBranchID in queries)) {
          queries[this.selectedCustomerBranchID] = {};
        }
        this.offlineItems = queries[this.selectedCustomerBranchID];

        //init List
        for (let key in this.offlineItems) {
          this.pushItem(this.offlineItems[key], false);
        }
        //saveOffline
        this.saveOfflineData().then(status => {
          resolve(status);
        }).catch(error => {
          reject(error);
        });
      }).catch(error => {
        reject(error);
      });
    });
  }

  pushItem(item, addToOffline: boolean = true) {
    item['ResponseDateTimeInMili'] = new Date(item.ResponseDateTime).getTime();

    let ticketNo = item.TicketNo;
    let index = this.getIndexOfTicket(ticketNo);
    if (index === -1) {//push
      index = this.items.push(item);
      //making copy for search
      this.itemsSearchCopy.push(item);
      //adding ticketno
      this.itemsTicketNo.push(ticketNo);

      //listening to count event
      this.listenToFirebaseChatEvent(item);
    } else {//update
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

  addToOffline(item) {
    this.offlineItems[item.TicketNo] = item;
  }

  saveOfflineData() {
    return new Promise((resolve, reject) => {
      this._storage.get('OfflineQuery').then(queries => {
        if (_.isEmpty(queries)) {
          queries = {};
        }
        //checking if this office is set
        if (!(this.selectedCustomerBranchID in queries)) {
          queries[this.selectedCustomerBranchID] = {};
        }

        queries[this.selectedCustomerBranchID] = this.offlineItems;

        this._storage.set('OfflineQuery', queries).then(status => {

          resolve(status);
        }).catch(error => {
          reject(error);
        });
      })
    });
  }

  initData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.doPost('Communication/GetAllQueries', {
        BranchID: this.selectedOffice.CustomerBranchID,
        DoctorID: 0,
        DisablePaging: false,
        PageNumber: this.page,
        RowsPerPage: 100,
      }, this.items.length === 0).then((response: any) => {
        for (let i = 0; i < response.length; i++) {
          //converting date to miliseconds
          this.pushItem(response[i]);
        }
        this.page++;
        //checking if already searched
        // this.getItems();
        this.saveOfflineData().then(status => {
          resolve(status);
        }).catch(error => {
          reject(error);
        });
      }).catch(error => {
        setTimeout(() => {
          this.page = -1;
          reject(error);
        });
      });
    });
  }


  segmentChanged(event) {
    this.selectedTab = event.value;
    this.setTitle();

    this.scrollToTop();
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

  setTitle() {
    this.title = this.queries_text + ': ' + this.titles[this.selectedTab];
  }

  getStatusColor(status) {
    return this.status[status].color;
  }

  getStatusLabel(status) {
    return this.status[status].label;
  }

  doInfinite(paginator) {
    this.initData().then(() => {
      paginator.complete();
      this.content.resize();
    }).catch((error) => {
      paginator.enable(false);
      this.content.resize();
    })

  }

  onCancel(event) {
    this.items = this.itemsSearchCopy;
  }

  isHidden(item) {
    // ALL
    if (this.selectedTab === 'All') {
      return false;
    } else if (this.selectedTab === 'Today' && item.IsTodayQuery) { //For Today
      return false;
    }
    return item.QueryStatus !== this.selectedTab
  }

  openChat(item, index) {
    console.log(item);
    
    this.setUnReadCount(item, index).then(status => {
      let chatParams = item.TicketNo;
      if (Global.work_with_impression_no) {
        chatParams = {
          ImpressionNo: item.ImpressionNo,
          TicketNo: item.TicketNo,
          Patient : item.Patient
        }
      }
      this.navCtrl.push(ChatPage, chatParams);
    }).catch(error => {
   
    })
  }

  setUnReadCount(item, index) {
    return new Promise((resolve, reject) => {

      if (item.UnreadCount) {
        if (this.items && typeof this.items[index] !== 'undefined') {
          this.items[index].UnreadCount = 0;

        }
        item.UnreadCount = 0;
        this.offlineItems[item.TicketNo].UnreadCount = 0;

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

  getItems() {
    const fields = ['Doctor', 'ImpressionNo', 'ReferenceEntryNo', 'Patient'];
    // Reset items back to all of the items
    this.items = this.itemsSearchCopy;

    // if the value is an empty string don't filter the items
    if (this.searchText && this.searchText.trim() != '') {
      //lowercase 
      this.searchText = this.searchText.toLowerCase();
      this.items = this.items.filter((item) => {
        for (let i = 0; i < fields.length; i++) {
          if (item[fields[i]].toLowerCase().indexOf(this.searchText) > -1) {
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

  listenToFirebaseChatEvent(item) {
    let ticketNo = item.TicketNo;
    let chatParams = Global.work_with_impression_no ? item.ImpressionNo : item.TicketNo;
    let path = 'NewChatEvent/' + chatParams + '/' + this.connection.user.id;

    if (!(path in this.newChatEventRefs)) {
      let itemRef = firebase.database().ref(path)
      this.newChatEventRefs[path] = itemRef;

      //removing existing as we just got it from server
      itemRef.remove();
      //now listening to new
      itemRef.on('child_added', (snapshot) => {
        let count = snapshot.val();
        let time = new Date().getTime();

        //count
        item.UnreadCount = count;
        item.ResponseDateTime = new Date().getTime();
        item.ResponseDateTimeInMili = new Date().getTime();

        setTimeout(() => {
          //setting value
          let index = this.getIndexOfTicket(ticketNo);
          if (this.items[index].TicketNo === ticketNo) {
            this.items[index] = item;
            this.itemsSearchCopy[index] = item;
            this.offlineItems[item.TicketNo] = item;

            this.saveOfflineData().catch(error => {

            });
          } else {

          }
        });

        itemRef.remove();
      });
    }
  }

  listenToFirebaseQueryEvent() {
    let path = 'NewQueryEvent/' + this.selectedOffice.CustomerBranchID + '/' + this.connection.user.id;
    //checking if not already listening
    if (!(path in this.newQueryEventRefs)) {
      let queryRef = firebase.database().ref(path)
      this.newQueryEventRefs[path] = queryRef;

      queryRef.on('child_added', (snapshot) => {
        let item = snapshot.val();
        if (typeof item.QueryStatus === 'undefined') {
          item.QueryStatus = 'Pending';
        }
        //checking if already exist
        if (this.getIndexOfTicket(item.TicketNo) === -1) {
          item.ResponseDateTimeInMili = new Date().getTime();

          this.items.unshift(item);
          this.itemsTicketNo.unshift(item.TicketNo);

          this.itemsSearchCopy.unshift(item);
          this.offlineItems[item.TicketNo] = item;

          //saving for next time use
          this.saveOfflineData();

          //listening to new chat on it
          this.listenToFirebaseChatEvent(item);
        }
        queryRef.remove();
      });
    }
  }

  ionViewWillLeave() {
    for (let key in this.newChatEventRefs) {
      this.newChatEventRefs[key].off('child_added');
      delete this.newChatEventRefs[key];
    }
    for (let key in this.newQueryEventRefs) {
      this.newQueryEventRefs[key].off('child_added');
      delete this.newQueryEventRefs[key];
    }
  }

  getIndexOfTicket(ticketNo) {
    let index = -1;
    if (ticketNo) {
      index = this.itemsTicketNo.indexOf(ticketNo);
      if (index === -1) {
        return index;
      }
      //verifying if its indeed right index
      if (this.items && this.items[index].TicketNo !== ticketNo) {
        //looping to find
        let index = 0;
        this.items.forEach(item => {
          if (item.TicketNo === ticketNo) {
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

  openRx(item, index, event) {
    event.preventDefault();
    event.stopPropagation();
    if (item.Rx && item.Rx !== '') {
      let url = item.Rx + '?v=' + (new Date().getTime());
      this.photoViewer.show(url, 'Rx', { share: false });
    } else {
      let alert = this.alert.create({
        subTitle: 'Image Not Found',
        buttons: ['Ok']
      });
      alert.present();
    }
    
  }
}
