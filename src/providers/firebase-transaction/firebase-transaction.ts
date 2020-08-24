import { Injectable, NgZone } from '@angular/core';
import * as firebase from 'firebase';
import * as _ from 'underscore';

@Injectable()
export class FirebaseTransactionProvider {
  slicedCount: number = 500;
  constructor(
    private zone: NgZone,
  ) {
  }

  doTransaction(transations: Array<{ Path?: string, Value?: number, ValueStr?: string }>) {
    return new Promise((resolve, reject) => {
      if (!_.isEmpty(transations)) {
        var processed = 0;
        if (transations.length < 100) {
          
        }
        let afterFirstN = null
        //checking if if its more than 1000, then going in chunks
        if (transations.length > this.slicedCount) {
          //make a chunk, process this and then process next
          let firstN = transations.slice(0, this.slicedCount);
          afterFirstN = transations.slice(this.slicedCount);

          //assign
          transations = firstN;
        }
        transations.forEach((object) => {
          let value: any = null;
          if (object.Value !== null) {
            value = object.Value;
          }
          if (object.ValueStr !== null) {
            value = object.ValueStr;
          }
          if (value !== null) {
            let path = object.Path;
            //checking if value is an object
            
            if (typeof value === 'object') {
              let oldValue = value;
              try {
                value = JSON.parse(value);
              } catch (e) {
                value = oldValue;
              }
            }
            firebase.database().ref(path).set(value).then(result => {
              processed++;
              if (processed === transations.length) {
                this._processSliced(afterFirstN);
                resolve(true);
              }
            });
          } else {
            processed++;
            if (processed === transations.length) {
              this._processSliced(afterFirstN);
              resolve(true);
            }
          }
        });
      } else {
        reject('Empty');
      }
    });
  }

  private _processSliced(afterFirstN) {
    if (afterFirstN && afterFirstN.length) {
      setTimeout(() => {
        // this.zone.run(() => {
        
        this.doTransaction(afterFirstN).catch(error => {
          console.error(error);
        });
      });
      // });
    }
  }

}
