import { Component } from '@angular/core';
import { IonicPage, Events, NavController, NavParams, ViewController } from 'ionic-angular';

import { UserProvider } from '../../../providers/user/user';
import { ConnectionProvider } from '../../../providers/connection/connection';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { Network } from '@ionic-native/network';

import { Global } from '../../../app/global';

import { PasswordValidation } from "./password-validation";

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {
  changePasswordForm: FormGroup;
  submitted = false;
  global: any = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewController: ViewController,
    public user: UserProvider,
    public connection: ConnectionProvider,
    public events: Events,
    public formBuilder: FormBuilder,
    private network: Network,
  ) {
    this.global = Global;
    this.changePasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    }, {
        validator: PasswordValidation.MatchPassword
      });
  }

  ionViewDidLoad() {
    //checking if offline
    if (this.network.type === 'none') {
      this.dismiss('Not available in Offline');
    } else {
      //getting profile data from server
      this.getData();
    }
  }

  getData() {
    this.connection.doPost('MobileApp/GetUserProfile').then(response => {

    }).catch(error => {
      this.dismiss(error);
    });
  }

  update() {
    //prevent dublicate submit
    if (this.submitted) {
      return false;
    }
    this.submitted = true;
    //updating
    this.connection.doPost('MobileApp/UserProfile_ChangePassword', {
      Password: this.changePasswordForm.get('new_password').value,
      OldPassword: this.changePasswordForm.get('password').value,
    }, 'changing').then((response: any) => {
      if (response.Status) {
        this.events.publish('toast:create', response.Message);
        this.dismiss(response);
      } else {
        this.submitted = false;
        this.events.publish('toast:error', response.Message);
      }
    }).catch(error => {
      this.submitted = false;
    });
  }

  dismiss(data) {
    this.viewController.dismiss(data);
  }

}
