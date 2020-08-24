import { Component, Input } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';
import { Events, ModalController, NavController, ViewController } from 'ionic-angular';
import { Global } from '../../app/global';
import { ContactUsPage } from '../../pages/contact-us/contact-us';
import { UserProvider } from '../../providers/user/user';






@Component({
    selector: 'reach-us',
    templateUrl: 'reach-us.html'
})
export class ReachUsComponent {
    _address: boolean = false;
    global: any = {};
    hideContactUsLink: boolean = true;
    constructor(
        public nav: NavController,
        public viewConrtoller: ViewController,
        private _emailComposer: EmailComposer,
        private _callNumber: CallNumber,
        public modalCtrl: ModalController,
        public user: UserProvider,
        public events: Events
    ) {
        this.viewConrtoller.willEnter.subscribe(() => {
            //checking if page is Contact us or Enquiry Add
            let activeComponentName = Global.getActiveComponentName(this.nav.getActive());
            if (['ContactUsPage', 'EnquiryAddPage'].indexOf(activeComponentName) === -1) {
                this.hideContactUsLink = true;
            }
        })
        this.global = Global;
    }

    @Input()
    set address(address: boolean) {
        this._address = address;
    }

    get address() {
        return this._address;
    }

    onContactUs() {
        let modal = this.modalCtrl.create(this.user.isLoggedIn() ? null : ContactUsPage);
        modal.onDidDismiss(data => {
            if (data) {
                this.events.publish('alert:basic', data.title, data.message);
            }
        });
        modal.present();
    }

    callNumber(number) {
        this._callNumber.callNumber(number, true)
    }

    openEmail(email) {
        this._emailComposer.isAvailable().then((available: boolean) => {
            if (available) {
                this._emailComposer.open({
                    to: email,
                    subject: Global.APP_NAME + ' App Support',
                    body: '',
                    isHtml: true
                });
            }
        });
    }

}
