import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { Events, Platform } from 'ionic-angular';
import { ConnectionProvider } from './../connection/connection';


@Injectable()
export class CommonProvider {
  isIOS: boolean = false;
  isAndroid: boolean = false;
  isCordova: boolean = false;
  menuPages: any[];

  constructor(
    private file: File,
    private platform: Platform,
    private events: Events,
    public connection: ConnectionProvider
  ) {
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
    this.isCordova = this.platform.is('cordova');
  }

  build_query(params) {

    var esc = encodeURIComponent;
    return Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&');
  }


}
