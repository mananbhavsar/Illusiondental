import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Events, IonicPage, NavController } from 'ionic-angular';
import { ConnectionProvider } from '../../providers/connection/connection';
import { LoginPage } from "../login/login";


@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  ForgotPassword: { login_name?: string } = {};
  forgotPasswordForm: FormGroup;
  global: any = {};

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public formBuilder: FormBuilder,
    public connection: ConnectionProvider,
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      login_name: ['', Validators.required],
    });
  }


  doForgotPassword() {
    this.connection.doPost('Account/Validate_ForgotPassword', {
      UserCode: this.ForgotPassword.login_name,
    }, 'resetting password').then(response => {
      this.events.publish('alert:basic', 'Password sent!', response);
      this.navCtrl.push(LoginPage);
    }).catch(error=>{
      this.events.publish('toast:create', error);
    });
  }

  goBack(){
    this.navCtrl.pop();
  }

}
