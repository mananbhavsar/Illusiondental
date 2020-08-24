import { Component, Input } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import * as firebase from 'firebase';
import { Platform } from 'ionic-angular';
@Component({
  selector: 'call-fab',
  templateUrl: 'call-fab.html'
})
export class CallFabComponent {
  @Input() type: string;
  support: any;
  constructor(
    public callNumber: CallNumber,
    public platform: Platform
  ) {
    firebase.database().ref('support').on('value', snapshot => {
      this.support = snapshot.val();
    });
  }

  call() {
    let number = null;
    switch (this.type) {
      case 'PickUp':
        number = this.support.pick_up;
        break;

      case 'CaseStatus':
        number = this.support.case_status;
        break;

      case 'Aligners':
        number = this.support.case_status;
        break;

      case 'InVoice':
        number = this.support.invoice;
        break;

      case 'Payments':
        number = this.support.payment;
        break;

      default:
        number = this.support.landline;
        break
    }
    if (number) {
      if (this.platform.is('mobileweb') || this.platform.is('core')) {
        number = "tel:" + this.support.pick_up;
        window.location.href = number;
      } else  if (this.platform.is('cordova')) {
        this.callNumber.callNumber(number, true);
      }
    }
  }





}
