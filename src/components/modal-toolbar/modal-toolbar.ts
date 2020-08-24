import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'modal-toolbar',
  templateUrl: 'modal-toolbar.html'
})
export class ModalToolbarComponent {
  @Input() title: string = null;
  @Input() subTitle: string = null;
  @Input() badgeCount: number = 0;
  @Input() color: string = 'primary';

  @Output() dismiss = new EventEmitter();
  constructor() {

  }

  sendDismiss(data) {
    this.dismiss.emit(data);
  }
}
