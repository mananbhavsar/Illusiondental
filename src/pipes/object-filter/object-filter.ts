import { Pipe, PipeTransform } from '@angular/core';
import * as _ from "underscore";



@Pipe({
  name: 'objectFilter',
})
export class ObjectFilterPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(keys: any[], field: string, value: string, objects: {}): any[] {
    if (!keys) return [];
    if (!value || value.length == 0) return keys;
    value = value.trim();
    if (_.isEmpty(objects)) return keys;
    let resultKeys = [];
    for(let key in objects){
      let item = objects[key];
      if(item[field].toLowerCase().indexOf(value.toLowerCase()) !== -1){
        resultKeys.push(key);
      }
    }
    return resultKeys;
  }
}
