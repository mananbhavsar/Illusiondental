import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';
import { Events, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Global } from '../../../app/global';
import { ConnectionProvider } from '../../../providers/connection/connection';
import { UserProvider } from '../../../providers/user/user';


@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {
  editProfileForm: FormGroup;
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
    private storage: Storage,
  ) {
    this.global = Global;
    this.editProfileForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      mobile_number: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^\d{10}$/)]]
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
      this.editProfileForm.setValue({
        name: response[0].Displayname,
        email: response[0].EmailID,
        mobile_number: response[0].MobileNo,
      });
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
    this.connection.doPost('MobileApp/UserProfile_EditInfo', {
      DisplayName: this.editProfileForm.get('name').value,
      EmailID: this.editProfileForm.get('email').value,
      MobileNo: this.editProfileForm.get('mobile_number').value,
    }, 'updating').then((response: any) => {
      if (response.Status) {
        this.events.publish('toast:create', response.Message);
        //set in User data
        this.storage.get('User').then(user => {
          if (user) {
            user.DisplayName = this.editProfileForm.get('name').value;
            user.Customer = this.editProfileForm.get('name').value;
            user.EmailID = this.editProfileForm.get('email').value;
            user.MobileNo = this.editProfileForm.get('mobile_number').value;

            this.storage.set('User', user).then(user => {
              this.dismiss(user);
              //publish user:updated event to all
              this.events.publish('user:changed', user);
            });
          } else {
            this.dismiss(null);
          }
        });
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
