import { Component } from '@angular/core';
import { Network } from '@ionic-native/network';
import { TranslateService } from "@ngx-translate/core";
import * as firebase from 'firebase';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import { ConnectionProvider } from "../../providers/connection/connection";
import { NotificationsProvider } from "../../providers/notifications/notifications";
import { HomePage } from "../home/home";
import { TimeSlots } from "./timeSlots";

@IonicPage()
@Component({
  selector: 'page-pickup',
  templateUrl: 'pickup.html'
})
export class PickupPage {
  title: string = 'loading';
  pick_up: string = 'Pickup';
  monday: string = 'Monday';
  tuesday: string = 'Tuesday';
  titles = ['Today', 'Tomorrow'];

  selectedOffice: any = {};
  selectedCustomerBranchID: number = null;

  selectedTab: string = '0';

  time: number;
  timeSlot;
  serverHour;
  serverMinutes;
  serverTime: Number;
  timeDifference: number = 45;
  disablePickupButton: Boolean = true;
  disableRadio: Boolean;
  serverDate: moment.Moment = null;

  request_sent: string = 'Request Sent';
  pickup_request_alert: string = '';
  pickup_offline: string = '';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public connection: ConnectionProvider,
    private network: Network,
    private translate: TranslateService,
    private notifications: NotificationsProvider,
  ) {
    this.selectedOffice = this.navParams.data.selectedOffice;
    this.selectedCustomerBranchID = this.navParams.data.selectedCustomerBranchID;
    this.setTitle();
  }

  doTranslate() {
    //loading
    this.translate.get('Common._Loading_').subscribe((translated: string) => {
      if (this.title === 'loading') {
        this.title = translated;
      }
    });
    //today
    this.translate.get('PickUP._Today_').subscribe((translated: string) => {
      this.titles[0] = translated;
    });
    //tomorrow
    this.translate.get('PickUP._Tomorrow_').subscribe((translated: string) => {
      this.titles[1] = translated;
    });
    //pickup
    this.translate.get('PickUP._Pickup_').subscribe((translated: string) => {
      this.pick_up = translated;
    });
    //monday
    this.translate.get('PickUP._Monday_').subscribe((translated: string) => {
      this.monday = translated;
    });
    //tuesday
    this.translate.get('PickUP._Tuesday_').subscribe((translated: string) => {
      this.tuesday = translated;
    });
    //request sent
    this.translate.get('PickUP._RequestSent_').subscribe((translated: string) => {
      this.request_sent = translated;
    });
    //request alert
    this.translate.get('PickUP.PickupRequestAlert').subscribe((translated: string) => {
      this.pickup_request_alert = translated;
    });
    //offline
    this.translate.get('PickUP._Offline_').subscribe((translated: string) => {
      this.pickup_offline = translated;
    });
  }

  ionViewCanEnter() {
    this.doTranslate();
    if (this.network.type === 'none') {
      this.events.publish('toast:error', this.pickup_offline);
    }
    return this.network.type !== 'none';
  }

  ionViewDidEnter() {
    this.initData();
  }

  initData() {
    //getting server time
    this.connection.doPost('Pickup/Get_ServerTime', {}, true).then((response) => {
      this.serverHour = moment(response, 'MM/DD/YYYY hh:mm:ss A').format("k");
      this.serverMinutes = moment(response, 'MM/DD/YYYY hh:mm:ss A').format("m");
      this.serverTime = parseInt(this.serverHour) * 60 + parseInt(this.serverMinutes);
      this.serverDate = moment(response, 'MM/DD/YYYY hh:mm:ss A');
      this.timeSlot = TimeSlots;
      setTimeout(() => {
        this.setTitle();
      });
    });
  }

  resetTime() {
    //clear selected Time
    this.time = null;
    //disable button
    this.disablePickupButton = true;
  }

  setTitle() {
    this.title = this.pick_up + ': ' + this.titles[parseInt(this.selectedTab)];  
  }

  segmentChanged(event) {
    this.selectedTab = event.value;
    this.setTitle();

    this.resetTime();
  }

  isDisabled(time) {
    //checking if tab is not sunday
    if (this.isSunday()) {
      this.titles[0] = this.monday;
      this.titles[1] = this.tuesday;
      return false; // all available
    } if (this.isSaturday()) { //next day sunday
      this.titles[1] = this.monday;
    }
    if (this.selectedTab === '1') { //no disable to all for tomorrow
      return false;
    } else {
      /**
       * today checking if time already passed
       */
      let seletedTime = parseInt(time.time) * 60 - this.timeDifference;
      return seletedTime <= this.serverTime;
    }
  }

  isSunday() {
    return this.serverDate.day() === 0;
  }
  isSaturday() {
    return this.serverDate.day() === 6;
  }

  selectTime() {
    if (this.time) {
      this.disablePickupButton = false;
    } else {
      this.disablePickupButton = true;
    }
  }

  confirm() {
    let date = this.serverDate;
    //checking tab selected vs day
    if (this.selectedTab === '0') {
      if (this.isSunday()) {
        //making it plus 1
        date = date.add(1, 'day');
      }
    } else {
      if (this.isSunday() || this.isSaturday()) {
        //making it plus 2
        date = date.add(2, 'day');
      } else {
        date = date.add(1, 'day');
      }
    }

    const pickupDateTime = moment().set({ date: date.get('date'), 'hour': this.time, 'minute': 0, 'second': 0, 'millisecond': 0 }).toISOString();

    this.connection.doPost('Pickup/Insert_PP_TPickUP', {
      PickupDateTime: pickupDateTime,
      CreatedByID: this.connection.user.CustomerPortalID,
    }).then((response: any) => {

      this.events.publish('alert:basic', this.request_sent, this.pickup_request_alert);

      //Increment count
      this.increaseCount('PickUpCount');
      this.increaseCount('Total');

      //sending notifications
      response.Data.forEach((data: any) => {
        this.notifications.send(data.DeviceID, data.Title, data.Message, data.Badge).catch(error => { });
      });

      this.navCtrl.setRoot(HomePage);
    }).catch(error => {

    });
    this.time = null;
    this.disablePickupButton = true;
  }

  /**
   * This will increase badge count if pick set
   */
  increaseCount(path) {
    let ref = firebase.database().ref('Badge/' + this.connection.user.id + '/' + path);
    ref.transaction(function (count) {
      count = count || 0;
      return count + 1;
    });
  }
}
