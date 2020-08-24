import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { Events, NavController, NavParams } from 'ionic-angular';
import { Global } from "../../app/global";
import { SearchPage } from '../../pages/search/search';


@Component({
    selector: 'header',
    templateUrl: 'header.html'
})
export class HeaderComponent {
    @Input() subTitle: string = null;
    @Input() buttons: any = null;
    @Output() buttonClicked = new EventEmitter();
    @Input() badgeCount: number = 0;
    _title: string;
    cartCounter: number = null;
    prevPageColor: string = null;
    colorHex = Global.color;
    constructor(
        public navCtrl: NavController,
        public events: Events,
        private _statusBar: StatusBar,
        public navParams: NavParams
    ) {
        this.navCtrl.viewDidEnter.subscribe(page => {
            setTimeout(() => {
                let currentPageColor = this.getColor(page.name);
                if (true || this.prevPageColor !== currentPageColor) {
                    this.prevPageColor = currentPageColor;
                    //setting header color
                    this._statusBar.backgroundColorByHexString('#' + this.colorHex[this.prevPageColor]);
                }
            });
        });
    }

    @Input()
    set title(title: string) {
        this._title = title;
    }

    get title() {
        return this._title;
    }

    openSearch() {
        this.navCtrl.push(SearchPage);
    }

    getColor(name: string = null) {
        name = Global.getActiveComponentName(this.navCtrl.getActive());
        //for aligner case status
        if (name === 'CaseStatusPage') {
            if ('patientCode' in this.navParams.data) {
                name = 'AlignersPage';
            }
        }
        switch (name) {
            case 'DashboardPage':
                return 'dashboard';

            case 'PickupPage':
            case 'PickupTodayPage':
            case 'PickupTomorrowPage':
                return 'pickup';

            case 'CaseStatusPage':
                return 'casestatus';

            case 'CommunicationPage':
                return 'communication';

            case 'InvoicePage':
                return 'invoice';

            case 'PaymentsPage':
                return 'payments';

            case 'AlignersPage':
                return 'aligners';

            default:
                return 'primary';
        }
    }

    sendButtonClicked(button, event) {
        this.buttonClicked.emit(button);
    }

}
