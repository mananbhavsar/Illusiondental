import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore';


@Pipe({
  name: 'keys',
})
export class KeysPipe implements PipeTransform {
  transform(value, args: string[], argsValues: string): any {
    let keys = [];

    //checking if we need to orderBy
    if (args && value) {
      //if single
      if (typeof args === 'string') {
        args = [args];
      }
      //checking if orderBy
      if (args[0] === 'orderBy') {
        let keysWithOrder: any = {};
        for (let key in value) {
          keysWithOrder[value[key][argsValues]] = key;
        }
        return _.values(keysWithOrder);
      }
    } else {
      for (let key in value) {
        keys.push(key);
      }
    }
    return keys;
  }
}
