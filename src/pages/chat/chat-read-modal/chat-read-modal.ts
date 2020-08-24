import { Component } from '@angular/core';
import * as firebase from 'firebase';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import * as moment from 'moment';


@IonicPage()
@Component({
  selector: 'page-chat-read-modal',
  templateUrl: 'chat-read-modal.html',
})
export class ChatReadModalPage {
  message: any = {};
  chatUsers: any = {};
  userID = null;
  ticket: string = null;
  loginTypeID = null;

  messageReadRef: firebase.database.Query;

  reads: Array<any> = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
  ) {
    this.message = this.navParams.data.message;
    this.chatUsers = this.navParams.data.chatUsers;
    this.ticket = this.navParams.data.ticket;
    this.userID = this.navParams.data.userID;
    this.loginTypeID = this.navParams.data.loginTypeID;

    //listen for read event
    this.messageReadRef = firebase.database().ref('Communications/' + this.ticket + '/' + 'Chat/Read');
  }

  ionViewDidLoad() {
    this.messageReadRef.on('child_changed', (snapshot) => {
    });
    this.makeList();
  }

  makeList() {
    this.reads = [];
    if (this.message.Read) {
      for (let userId in this.message.Read) {
        //not adding for self
        if (userId !== this.message.UserID && userId !== this.userID) {//sent by or me
          //escaping if no name present
          if (userId in this.chatUsers) {
            this.reads.push({
              name: this.chatUsers[userId].Name,
              time: this.message.Read[userId],
            });
          }
        }
      }
    }
  }

  ionViewWillLeave() {
    //off read event
    this.messageReadRef.off('child_changed');
  }

  dismiss(data) {
    this.viewCtrl.dismiss();
  }

  getTime(time) {
    if (time) {
      let momentTime = null;

      momentTime = moment(time).utc().local();
      //checking if its dd-mm-yyy format
      if (!momentTime.isValid() && moment(time, 'DD-MM-YYYY hh:mm:ss').isValid()) {
        momentTime = moment(time, 'DD-MM-YYYY hh:mm:ss').utc().local();
      }
      if (momentTime.isValid()) {
        var today = moment().startOf('day');

        if (momentTime.isSame(today, 'd')) {// today
          return momentTime.format('hh:mm a');
        } else if (momentTime.isBetween(moment().subtract(7, 'days').startOf('day'), today)) { //within a week
          return momentTime.format('ddd D, hh:mm a');
        } else if (momentTime.isBetween(moment().startOf('month'), today)) { //within a month
          return momentTime.format('ddd D, hh:mm a');
        } else {
          return momentTime.format('ddd, D MMM hh:mm a');
        }
      } else {
      }
    }
    return time;
  }

  inRead(userId) {
    //checking if its logged in user
    if (userId === this.message.UserID) {
      return true;
    }
    return (userId in this.message.Read);
  }
}
