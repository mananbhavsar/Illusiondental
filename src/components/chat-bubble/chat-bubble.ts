import { Component, ElementRef, Input } from '@angular/core';
import { Network } from '@ionic-native/network';
import { StreamingMedia } from '@ionic-native/streaming-media';
import { TranslateService } from "@ngx-translate/core";
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { Events, NavController, Platform } from 'ionic-angular';
import { ImageViewerController } from 'ionic-img-viewer';
import * as moment from 'moment';
import 'moment/locale/en-gb';
import 'moment/locale/fr';
import * as _ from 'underscore';
import { Global } from '../../app/global';
import { FileOpsProvider } from "../../providers/file-ops/file-ops";


@Component({
  selector: 'chat-bubble',
  templateUrl: 'chat-bubble.html',
})
export class ChatBubbleComponent {
  element: any = null;
  @Input() message: any;
  @Input() userID: string;
  @Input() ticket: string;
  @Input() impressNo: string;
  @Input() users: any = {};
  @Input() LoginTypeID: number = 0;
  @Input() myLanguage: string = 'en';

  global: any = Global;

  pathIdentifier: string = null;
  basePath: string = '';
  messagePath: string = '';
  statusRef = null;
  dataDirectory: string = null;
  downloadDirectory: string = null;
  selectedTrack: number;
  isCordova: boolean = false;
  isWeb: boolean = false; Î

  not_available_offline_translate: string = 'Not available in Offline';
  constructor(
    public angularFireDB: AngularFireDatabase,
    private platform: Platform,
    private events: Events,
    private navCtlr: NavController,
    private streamingMedia: StreamingMedia,
    private _imageViewerController: ImageViewerController,
    private _elementRef: ElementRef,
    private network: Network,
    private translate: TranslateService,
    private fileOps: FileOpsProvider,
  ) {
    this.global = Global;
    this.isCordova = this.platform.is('cordova');
    this.isWeb = this.platform.is('core');

    //listening to page change event to pause audio
    this.navCtlr.viewWillLeave.subscribe(event => {

    });
    this.events.subscribe('platform:onPause', (event) => {

    });

  }

  doTranslate() {
    this.translate.get('ChatScreen._NotAvailableOffline_').subscribe(translated => {
      this.not_available_offline_translate = translated;
    });
  }

  ngOnInit() {
    this.doTranslate();
    if (Global.work_with_impression_no) {
      this.pathIdentifier = this.impressNo;
    } else {
      this.pathIdentifier = this.ticket;
    }
    if (this.pathIdentifier) {
      this.basePath = 'Communications/' + this.pathIdentifier + '/';
      this.messagePath = this.basePath + 'Chat/' + this.message.key;

      this.doReading();

      this.fileOps.getDataDirectory().then((path: string) => {
        this.dataDirectory = path;

        this.downloadDirectory = this.dataDirectory + this.ticket + '/';
        this.fileOps.createDirectoryIfNotExist(this.dataDirectory, this.ticket);

        this.processFile();
      }).catch(error => {

      });

      // this.processBadgeCount();
    }
  }

  ngOnDestroy() {
    this.events.unsubscribe('platform:onPause');
    this.events.unsubscribe('message:file:deleted');
  }

  doReading() {
    //only if active page is chat
    if (Global.getActiveComponentName(this.navCtlr.getActive()) === 'ChatPage') {
      //adding myself to read list
      if (this.message.Read && this.userID in this.message.Read) {//already read by me
        if (this.message.Status !== 2) { // & not 2 already
          this.updateStatus();
        }
      } else {
        //now making it read by me
        this.angularFireDB.object(this.messagePath + '/Read/' + this.userID).set(firebase.database.ServerValue.TIMESTAMP).then(result => {
          if (this.message.Status !== 2) { // & not 2 already
            this.updateStatus();
          }
        });
      }
    }
  }


  /**
   * update status of message if sent by other user LoginTypeID
   * 1: if 
   * 2: if read by all
   */
  updateStatus() {
    /**
     * if sent by 
     * 1. Dentist
     *  1.1 even if single GroupUser reads, make it 2
     * 2. Group User
     *  2.1 If any single dentist read, make it 1
     *  2.2 read by all dentist & group users, make it 2
     */
    if (!('UserID' in this.message)) {
      this.message['UserID'] = 0;
    }
    if (!('LoginTypeID' in this.message)) {
      this.message['LoginTypeID'] = 0;
    }
    if (this.message.UserID !== this.userID) { //avoid same user type also
      let status = -1;
      //sent by 
      if ([Global.LoginType.Doctor, Global.LoginType.Parent].indexOf(this.message.LoginTypeID) > -1 && this.LoginTypeID === Global.LoginType.Group) { //dentist & read by group user
        status = 2;
      } else if ([Global.LoginType.LabGuru, Global.LoginType.Group].indexOf(this.message.LoginTypeID) > -1) { //sent by group user
        //checking if read by all
        if (_.size(this.message.Read) === _.size(this.users)) {
          status = 2;
        } else if ([Global.LoginType.Doctor, Global.LoginType.Parent].indexOf(this.LoginTypeID) > -1 && this.message.Status === 0) { //read by any dentist
          status = 1;
        }
      }
      if (status > 0) {
        this.angularFireDB.object(this.messagePath + '/Status').set(status);
      }
    }
  }

  openFile() {
    if (this.network.type === 'none') {
      this.events.publish('toast:error', this.not_available_offline_translate);
      return;
    }
    let file: string = this.message.URL;
    //if already downloading
    if (this.message.downloading) {
      return;
    }
    let wasDownloaded = this.message.downloaded;
    this.check(file).then(entry => {
      if (wasDownloaded) {
        switch (this.message.MessageType) {
          case 'Image':
            this.openImage();
            break;

          case 'Audio':
            this.openAudio();
            break;

          case 'Video':
            this.openVideo();
            break;
        }
      }

    }).catch(error => {

    });
  }

  openImage() {
    this.element = this._elementRef.nativeElement.querySelector('#message-image-' + this.message.key);
    let image = this._imageViewerController.create(this.element);
    image.present();

  }

  openAudio() {
    if (this.isWeb) {
      window.open(this.message.URL, '_blank');
    } else {
      let options = {
        successCallback: () => { },
        errorCallback: (e) => { },
        shouldAutoClose: true,
        bgImage: 'https://s3-ap-southeast-1.amazonaws.com/eiosys/images/equilizer.gif',
      };
      this.streamingMedia.playAudio(this.message.nativeURL, options);
    }
  }

  openVideo() {
    if (this.isWeb) {
      window.open(this.message.URL, '_blank');
    } else {
      let options = {
        successCallback: () => { },
        errorCallback: (e) => { },
        shouldAutoClose: true,
      };
      this.streamingMedia.playVideo(this.message.nativeURL, options);
    }
  }

  check(file) {
    return new Promise((resolve, reject) => {
      if (this.isWeb) {
        this.message.downloaded = true;
        this.message.nativeURL = this.message.URL;
        resolve(true);
      } else if (this.isCordova) {
        this.fileOps.isFileDownloaded(file, this.downloadDirectory).then(status => {
          resolve(status);
        }).catch(error => {
          this.message.downloading = true;
          this.fileOps.downloadFile(file, this.downloadDirectory).then((entry: any) => {
            this.message.nativeURL = this.fileOps.getNativeURL(file, this.downloadDirectory);
            this.message.downloading = false;
            this.message.downloaded = true;

            this.subscribeToFileDelete(file);
            setTimeout(() => {
              resolve(entry);
            });
          }).catch(error => {
            this.message.downloading = false;
            this.message.downloaded = false;
            this.message['error'] = error;
            this.events.publish('toast:error', error);
            reject(error);
          })
        });
      }
    });
  }

  processFile() {
    //downloading file
    if (this.message.URL) {
      if (this.isCordova && !this.isWeb) {
        let file = this.message.URL;

        this.fileOps.isFileDownloaded(file, this.downloadDirectory).then(status => {
          if (status) {
            this.message['downloaded'] = true;
            this.message['downloading'] = false;
            this.message.nativeURL = this.fileOps.getNativeURL(file, this.downloadDirectory);

            this.subscribeToFileDelete(file);
          }
        }).catch(error => {
          //checking if sent by me and sent within last 500ms. We will try to download this
          if (this.message.UserID === this.userID && (moment().utc().valueOf() - this.message.CreateAt) <= 10000) {
            this.openFile();
          } else {
            this.message['downloaded'] = false;
            this.message['downloading'] = false;
          }
        });

      } else { //web
        this.message['downloaded'] = true;
        this.message.nativeURL = this.message.URL;
      }
    } else {
      this.message['downloaded'] = true;
    }
  }



  downloadMessage() {
    let file = this.message.URL;
    if (this.isCordova) {
      this.message.downloading = true;
      this.fileOps.downloadFile(file, this.downloadDirectory).then((entry: any) => {
        this.message.downloaded = true;
        this.message.nativeURL = this.fileOps.getNativeURL(entry.nativeURL, this.downloadDirectory);

        this.message.downloading = false;
        this.subscribeToFileDelete(file);
        this.makeTrackForAudio();
      }).catch(error => {
        this.message.downloading = false;
        this.message.downloaded = false;
        this.message['error'] = error;
      });
    }
  }

  getTime(time) {
    if (time) {
      let momentTime = null;

      momentTime = moment(time).utc().local();
      momentTime.locale(this.myLanguage);

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

  showRead(message) {
    if (this.LoginTypeID === Global.LoginType.Group) {
    }
  }

  /**
   * This will reduce badge count if message is newly sent & read first time
   */
  processBadgeCount() {
    if (this.message.BadgeCount) {
      //checking if not already reduced
      if (this.userID in this.message.BadgeCount && this.message.BadgeCount[this.userID]) {//in list && not yet made false
        //making it false first
        this.message.BadgeCount[this.userID] = false;
        this.angularFireDB.object(this.messagePath + '/BadgeCount/' + this.userID).set(false);

        //not reducing badge count from communication & total
        this.reduceCount('CommunicationCount');
        this.reduceCount('Total');

      }
    }
  }

  reduceCount(path) {
    let ref = firebase.database().ref('Badge/' + this.userID + '/' + path);
    ref.transaction(function (count) {
      count = count || 0;
      if (count === 0) {
        return count;
      }
      return count - 1;
    });
  }

  makeTrackForAudio() {
    this.message.audioTrack = {
      src: this.message.nativeURL
    };
  }

  onTrackFinished(track: any) {
    //re-adding this track
    // this.message.audioTrack = {
    //   src: null,
    // };
    setTimeout(() => {
      this.makeTrackForAudio();
    });
  }

  onHold(event) {
    //showing popover for read, translate
  }

  subscribeToFileDelete(file) {
    let fileName = file.substring(file.lastIndexOf('/') + 1);

    this.events.unsubscribe('message:file:deleted');
    this.events.subscribe('message:file:deleted', (deletedFileName) => {
      if (fileName === deletedFileName) {
        this.message.nativeURL = null;
        this.processFile();
      }
    });
  }

  isHidden() {
    //checking if sent by LabGuru & logged in user type is group then show tick
    if (this.message.LoginTypeID === Global.LoginType.LabGuru && this.LoginTypeID === Global.LoginType.Group) {
      return false;
    }
    return this.message.UserID !== this.userID;
  }

  getTextMessage() {
    //checking if MyLang exist in message
    if (!('Translation' in this.message)) {
      this.message['Translation'] = {};
    }
    if (!(this.myLanguage in this.message.Translation)) {
      this.message.Translation[this.myLanguage] = this.message.Message;
    }
    return this.message.Translation[this.myLanguage];
  }
}
