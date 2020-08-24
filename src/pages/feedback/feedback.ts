import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { Events, IonicPage, NavController, NavParams, ViewController, Platform } from 'ionic-angular';
import moment from 'moment';
import * as _ from 'underscore';
import { ConnectionProvider } from './../../providers/connection/connection';

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {
  title: any = "Feedback Form";
  forgotPasswordForm: FormGroup;
  Data: any = [];
  formData: any = {};
  btnActive: string;
  isReadonly: string;
  keys: any;
  subTitle: any;
  isBrowser: any;

  feedbackData: any = null;
  attachments: Array<any> = [];
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public storage: Storage,
    public connection: ConnectionProvider,
    public events: Events,
    public network: Network,
    public platform : Platform
  ) {
    this.Data = this.navParams.data;
    this.formData.ImpressionNo = this.Data.ImpressionNo;
    this.formData.Doctor = this.Data.Doctor;
    this.formData.Patient = this.Data.Patient;

    this.subTitle = 'Patient: ' + this.formData.Patient + ', Doctor: ' + this.formData.Doctor;
    
    this.storage.get('User').then(userData => {
      this.formData.LoginUser = userData.UserCode;
    })
    this.formData.Date = moment().format('DD/MM/YYYY');
    this.forgotPasswordForm = this.formBuilder.group({

    });

  }

  ionViewDidLoad() {
    this.isBrowser = this.platform.is('core');   
    if (this.network.type === 'none') {
      this.storage.get('feedbackOffline:' + this.formData.ImpressionNo).then(data => {
        this.feedbackData = data || {};
      }).catch((error) => {

      });
    } else {
      this.initData().then(response => { }).catch(error => {

      });
    }
  }

  initData() {
    return new Promise((resolve, reject) => {
      this.connection.doPost('FeedbackController/GetFeedbackDetail', {
        JobEntryNo: this.formData.ImpressionNo
      }, false).then((response: any) => {

        if (response && response.Data) {
          this.feedbackData = response.Data[0];
          this.attachments = this.feedbackData.Attachments.split(',');
          this.storage.set('feedbackOffline:' + this.formData.ImpressionNo, response.Data[0]);
        } else {
          this.feedbackData = {};
        }
      }).catch((error) => {
        this.feedbackData = {};
      });
    });
  }

  submitFeedback() {
    if (this.network.type === 'none') {
      this.events.publish('network:offline');
    } else {
      return new Promise((resolve, reject) => {
        this.connection.doPost('FeedbackController/InsertFeedbackDetail', {
          JobEntryNo: this.formData.ImpressionNo,
          OverallFit: this.formData.OverallFit,
          Occlusion: this.formData.Occlusion,
          InterProximalContact: this.formData.InterProximalContact,
          MarginalAccuracy: this.formData.MarginalAccuracy,
          ShadeAccuracy: this.formData.ShadeAccuracy,
          AnatomyContour: this.formData.AnatomyContour,
          PrescriptionFollowed: this.formData.PrescriptionFollowed,
          PatientSatisfaction: this.formData.PatientSatisfaction,
          TotalSeatingTime: this.formData.TotalSeatingTime,
          Comments: this.formData.Comments,
          ReferenceEntryNo: this.Data.ReferenceEntryNo,
          Branch: this.Data.Branch || 0,
          BranchID: this.Data.BranchID || 0,
          DoctorID: this.Data.DoctorID || 0,
          FileName: this.formData.FileName || 0,
          FileExtension: this.formData.FileExtension || 0,
          FileSize: 0,
          Rating: this.formData.Rate,
          LoginUser: this.formData.LoginUser,
          Patient: this.Data.Patient,
          Attachments: this.attachments.join(','),
        }).then((response: any) => {
          this.viewCtrl.dismiss(response);
          resolve(true);
        }).catch((error) => {
          reject();
        });
      });
    }

  }

  starClicked(value) {
    this.formData.Rate = value;
  }

  overallFit(val) {
    this.formData.OverallFit = val;
  }

  Occlusion(val) {
    this.formData.Occlusion = val;
  }

  InterProximalContact(val) {
    this.formData.InterProximalContact = val;
  }

  MarginalAccuracy(val) {
    this.formData.MarginalAccuracy = val;
  }

  ShadeAccuracy(val) {
    this.formData.ShadeAccuracy = val;
  }

  AnatomyContour(val) {
    this.formData.AnatomyContour = val;
  }

  PrescriptionFollowed(val) {
    this.formData.PrescriptionFollowed = val;
  }

  PatientSatisfaction(val) {
    this.formData.PatientSatisfaction = val;
  }

  dismiss(data) {
    this.viewCtrl.dismiss();
  }

  isEmpty(data) {
    return _.isEmpty(data);
  }

  captured(event) {
    this.attachments.push(event.url);
  }

  removeAttachment(event) {
    this.attachments.splice(event.index, 1);
  }
}
