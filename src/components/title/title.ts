import { Component, Input } from '@angular/core';
import { Events } from 'ionic-angular';
import { App } from 'ionic-angular/components/app/app';
import { UserProvider } from '../../providers/user/user';

@Component({
  selector: 'title',
  templateUrl: 'title.html'
})
export class TitleComponent {
  @Input() title: string = null;
  @Input() subTitle: string = null;
  @Input() badgeCount: number = 0;


  constructor(
    private _app: App,
    private _events: Events,
    private _user: UserProvider,
  ) {
    this._events.subscribe('badge:set', total => {
      this.setHtmlTitle();
    });
  }

  getBadgeCount() {
    let badgeString: any = '';
    if (this.badgeCount) {
      if (this.badgeCount > 100) {
        badgeString = '100+';
      } else {
        badgeString = this.badgeCount;
      }
    }
    return badgeString;
  }

  ngOnChanges() {
    this.setHtmlTitle();
  }

  setHtmlTitle() {
    if (this._user.totalBadgeCount) {
      this._app.setTitle(this.title + this.getTotalBadgeCount());
    } else {
      this._app.setTitle(this.title);
    }
  }

  getTotalBadgeCount() {
    return ' (' + this._user.totalBadgeCount + ')';
  }
}
