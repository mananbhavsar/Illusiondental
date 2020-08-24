import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safe',
})
export class SafePipe implements PipeTransform {
  constructor(protected _sanitizer: DomSanitizer) {
  }

  public transform(value: string): SafeHtml {
        return this._sanitizer.bypassSecurityTrustHtml(value);
  }
}
