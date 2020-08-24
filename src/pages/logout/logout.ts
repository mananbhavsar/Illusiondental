import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

import { UserProvider } from '../../providers/user/user';
import { Network } from '@ionic-native/network';

import { Storage } from '@ionic/storage';
import { TranslateService } from "@ngx-translate/core";

@IonicPage()
@Component({
    selector: 'page-logout',
    templateUrl: 'logout.html',
})
export class LogoutPage {
    timeout = null;
    offline_message_translate: string = 'Not available in Offline';
    loggedOut: boolean = false;
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public user: UserProvider,
        private network: Network,
        private translate: TranslateService,
        private events: Events,
        private storage: Storage,
    ) {

    }

    ionViewDidEnter() {
        this.translate.get('ChatScreen._NotAvailableOffline_').subscribe(translated => {
            this.offline_message_translate = translated;
        });

        this.listenToLogout();
        this.timeout = setTimeout(() => {
            if (!this.loggedOut) {
                this.storage.get('User').then(user => {
                    this.events.publish('user:ready', user);
                }).catch(error => {

                })
            }
        }, 10000);
    }

    ionViewWillLeave() {
        this.clearTimeout();
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    listenToLogout() {
        if (this.network.type === 'none') {
            this.loggedOut = true;
            this.clearTimeout();
            this.events.publish('toast:error', this.offline_message_translate);
            this.navCtrl.pop();
        } else {
            this.user.logout().then(response => {
                this.loggedOut = true;
                this.clearTimeout();
                this.navCtrl.setRoot('LoginPage');
            }).catch(error => {
                this.clearTimeout();
                this.navCtrl.setRoot('LoginPage');
            });
        }
    }

}
