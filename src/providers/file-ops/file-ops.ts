import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer';
import { Events, normalizeURL, Platform } from 'ionic-angular';
import * as mime from 'mime-types';
import { Global } from '../../app/global';

@Injectable()
export class FileOpsProvider {
  //camera
  private cameraOptions: CameraOptions = {
    quality: 80,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    targetHeight: 1024,
    targetWidth: 1024
  }
  private galleryOptions: CameraOptions = {
    quality: 80,
    correctOrientation: true,
    targetHeight: 1024,
    targetWidth: 1024,
    sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  }

  isIOS: boolean = false;
  isAndroid: boolean = false;
  isCordova: boolean = false;
  directory: string = null;
  progressPercent: number = 0;
  constructor(
    private file: File,
    private transfer: FileTransfer,
    private platform: Platform,
    private events: Events,
    private fileOpener: FileOpener,
    private camera: Camera,
  ) {
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
    this.isCordova = this.platform.is('cordova');
  }

  setDataDirecory() {
    this.getDataDirectory().then((path: any) => {
      this.directory = path;
    }).catch(error => {
      console.log(error);
    });
  }

  getDataDirectory() {
    return new Promise((resolve, reject) => {
      if (this.isCordova) {
        if (this.isAndroid) {
          //creating folder
          this.file.createDir(this.file.externalRootDirectory, Global.APP_NAME, false).then(entry => {
            resolve(this.file.externalRootDirectory + Global.APP_NAME + '/');
          }).catch(error => {
            if (error.code === 12) { //Dir Exist
              resolve(this.file.externalRootDirectory + Global.APP_NAME + '/');
            } else {
              reject(error);
            }
          });
        } else { //iOS
          resolve(this.file.dataDirectory);
        }
      } else {
        resolve(this.file.dataDirectory);
      }
    });
  }

  isFileDownloaded(file, directory) {
    return new Promise((resolve, reject) => {

      let fileName = this.getFileName(file);
      //checking if file downloaded
      this.file.checkFile(directory, fileName).then(status => {
        resolve(status);
      }).catch(error => {
        reject(error);
      });
    });
  }


  /**
   * Checks if file downloaded or downloads 
   * @param file remote file path
   * @param directory directory to check in
   */
  getFile(file, directory) {
    return new Promise((resolve, reject) => {
      this.isFileDownloaded(file, directory).then(status => {
        resolve(status);
      }).catch(error => {
        this.events.publish('toast:create', 'downloading...');
        this.downloadFile(file, directory).then((entry: any) => {
          resolve(entry);
        }).catch(error => {

          this.events.publish('toast:error', error);
          reject(error);
        });
      });
    });
  }

  openFile(file, directory, doNative: boolean = true) {
    return new Promise((resolve, reject) => {
      if (doNative) {
        file = this.getNativeURL(file, directory);
      }

      this.fileOpener.open(decodeURIComponent(file), mime.lookup(file)).then(status => {
        resolve(status);
      }).catch(error => {
        reject(error);
      });
    });
  };

  getNativeURL(file, directory) {
    if (file) {
      //checking if still http
      if (file.indexOf('https') === 0) {
        let fileName = this.getFileName(file);
        return normalizeURL(directory + fileName);
      }
      return normalizeURL(file);
    }
    return file;
  }

  downloadFile(file, directory, identifier = null) {
    return new Promise((resolve, reject) => {
      let fileName = this.getFileName(file);

      const fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.download(file, directory + fileName).then((entry) => {
        resolve(entry);
      }, (error) => {
        reject(error);
      }).catch(error => {

        reject(error);
      });
    });
  }

  createDirectoryIfNotExist(path, directoryName) {
    this.file.checkDir(path, directoryName).then(status => {
    }).catch(error => {
      if (error.code === 1) {
        this.file.createDir(path, directoryName, false).catch(error => { });
      }
    });
  }

  getFileName(file) {
    if (file.indexOf('?') === -1) {
      file += '?';
    }
    file = file.substring(0, file.lastIndexOf('?'));

    return file.substring(file.lastIndexOf('/') + 1);
  }

  getFileNameWithoutExtension(file) {
    if (file) {
      return file.substring(0, file.lastIndexOf('.'));
    }
  }

  getFileExtension(file) {
    if (file) {
      return file.substring(file.lastIndexOf('.') + 1);
    }
  }

  uploadFile(file, params, identifier) {
    return new Promise((resolve, reject) => {
      let fileName = this.getFileName(file);
      const fileTransfer: FileTransferObject = this.transfer.create();

      fileTransfer.upload(file, Global.SERVER_URL + 'Communication/InsertChat_Attachement', this.setFileOptions(file, params)).then(data => {
        if (data.response.indexOf('http') === -1) {
          reject(data);
        } else if (data.response.indexOf('>') > -1) {
          resolve(data.response.substring(data.response.indexOf('>') + 1, data.response.lastIndexOf('<')));
        } else {
          resolve(JSON.parse(data.response));
        }
      }, (err) => {
        this.progressPercent = 0;
        reject(err);
      }).catch(error => {
        reject(error);
      });

      fileTransfer.onProgress(event => {
        if (event.lengthComputable) {
          this.events.publish('upload:progress:' + identifier, {
            progress: parseInt('' + (event.loaded / event.total) * 100),
            identifier: identifier
          });
        }
      });
    });
  }


  setFileOptions(file, params = {}): FileUploadOptions {
    //removing ? if any
    if (file.indexOf('?') === -1) {
      file += '?';
    }
    file = file.substring(0, file.lastIndexOf('?'));
    let fileName = this.getFileName(file);
    let fileExtension = this.getFileExtension(file);

    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: fileName,
      mimeType: mime.lookup(fileExtension),
      chunkedMode: false,
      // headers: new Headers({
      //   // 'Content-Type': 'application/json',
      //   // Connection: "close",
      // }),
      params: params
    }
    return options;
  }

  captureAndUpload(type, identifier: string = null) {
    return new Promise((resolve, reject) => {
      this.capture(type).then(uri => {
        this.uploadFile(uri, {
          date: identifier || new Date().getTime(),
        }, identifier).then(uploadedURL => {
          resolve(uploadedURL);
        }).catch(error => {
          this.events.publish('toast:error', error);
          reject(error)
        });
      }).catch(error => {

      });
    });
  }

  capture(type) {
    return new Promise((resolve, reject) => {
      switch (type) {
        case 'camera':
        case 'image':
          let optons = type === 'camera' ? this.cameraOptions : this.galleryOptions;
          this.camera.getPicture(optons).then(url => {
            resolve(url);
          }).catch(error => {
            reject(error);
          });
          break;
      }
    });
  }


  openRemoteFile(file, directory = null, identifier) {
    return new Promise((resolve, reject) => {
      //check if directory null
      if (directory === null) {
        directory = this.directory;
      }
      this.isFileDownloaded(file, directory).then(status => {
        this.openFile(file, directory, identifier).then(status => {
          resolve(status);
        }).catch(error => {
          reject(error);
        });
      }).catch(error => {
        this.downloadFile(file, directory, identifier).then(status => {
          this.openFile(file, directory, identifier).then(status => {
            resolve(status);
          }).catch(error => {
            reject(error);
          });
        }).catch(error => {
          reject(error);
        });
      });
    });
  }
}
