import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';
import * as _ from 'underscore';


@Injectable()
export class OfflineStorageProvider {

  constructor(
    private _storage: Storage,
  ) {

  }

  getCase(type, customerBranchID, withAllCustomer: boolean = false) {
    return new Promise((resolve, reject) => {
      this._storage.get(type).then(data => {
        if (_.isEmpty(data)) {
          data = {};
        }
        //checking if this office is set
        if (!(customerBranchID in data)) {
          if (type === 'OfflineAligners') {
            data[customerBranchID] = {
              patients: {},
              cases: {}
            };
          } else {
            data[customerBranchID] = {};
          }
        }
        if (withAllCustomer) {
          resolve(data);
        } else {
          resolve(data[customerBranchID]);
        }
      }).catch(error => {
        reject(error);
      })
    });
  }

  setCase(type, customerBranchID, data) {
    return new Promise((resolve, reject) => {
      this.getCase(type, customerBranchID, true).then(storedData => {
        //update
        if (type === 'OfflineAligners') {
          if (_.isEmpty(storedData[customerBranchID])) {
            storedData[customerBranchID] = {
              patients: {},
              cases: {}
            };
          }
          storedData[customerBranchID].patients = data;
        } else {
          storedData[customerBranchID] = data;
        }
        //save
        this._storage.set(type, storedData).then(storedData => {
          resolve(storedData);
        }).catch(error => {
          reject(error);
        });

      }).catch(error => {
        reject(error);
      })
    });
  }

}
