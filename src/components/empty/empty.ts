import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

/**
 * Generated class for the EmptyComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'empty',
    templateUrl: 'empty.html'
})
export class EmptyComponent {
    _text: string = null;
    constructor(
        public navCtrl: NavController,
    ) {

    }

    @Input()
    set text(text: string) {
        this._text = text;
    }

    get text() {
        return this._text;
    }


}
