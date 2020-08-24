import { NgModule } from '@angular/core';
import { KeyboardAttachDirective } from './keyboard-attach/keyboard-attach';
import { LongPressDirective } from './long-press/long-press';
@NgModule({
    declarations: [
        KeyboardAttachDirective,
    LongPressDirective,
    ],
    imports: [
        
    ],
    exports: [
        KeyboardAttachDirective,
    LongPressDirective,
    ]
})
export class DirectivesModule { }
