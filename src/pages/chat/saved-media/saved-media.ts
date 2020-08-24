import { Component, ElementRef } from '@angular/core';
import { File } from '@ionic-native/file';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { StreamingMedia } from '@ionic-native/streaming-media';
import { VideoEditor } from '@ionic-native/video-editor';
import { TranslateService } from "@ngx-translate/core";
import { UUID } from 'angular2-uuid';
import { ActionSheetController, Events, IonicPage, NavController, NavParams, normalizeURL, ViewController } from 'ionic-angular';
import { ImageViewerController } from 'ionic-img-viewer';
import * as mime from 'mime-types';
import { Global } from '../../../app/global';




@IonicPage()
@Component({
  selector: 'page-saved-media',
  templateUrl: 'saved-media.html',
})
export class SavedMediaPage {
  files: Array<any> = [];
  filesInitiated: boolean = false;
  path: string = '';
  folder: string = '';

  selectedTab: string = null;

  save_to_gallery_tranlate: string = 'Video';
  delete_translate: string = 'Delete';
  deleted_translate: string = 'Deleted';
  saved_translate: string = 'Saved';
  failed_to_delete_translate: string = 'Failed to delete!';
  failed_to_save_transalate: string = 'Failed to save';
  cancel_translate: string = 'Cancel';
  permission_not_granted_translate: string = 'Permissions weren\'t granted to save';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private _file: File,
    private _videoEditor: VideoEditor,
    private _actionSheetCtrl: ActionSheetController,
    private _events: Events,
    private _photoLibrary: PhotoLibrary,
    private _viewController: ViewController,
    private streamingMedia: StreamingMedia,
    private _elementRef: ElementRef,
    private _imageViewerController: ImageViewerController,
    private translate: TranslateService,
  ) {
    this.path = this.navParams.data.path;
    this.folder = this.navParams.data.folder;

    this.selectedTab = 'image';
  }

  ionViewDidLoad() {

  }

  segmentChanged(event) {

  }

  doTranslate() {
    //save_to_gallery_tranlate
    this.translate.get('ChatScreen._SaveToGallery').subscribe(translated => {
      this.save_to_gallery_tranlate = translated;
    });
    //cancel
    this.translate.get('Common._Cancel_').subscribe(translated => {
      this.cancel_translate = translated;
    });
    //delete
    this.translate.get('ChatScreen._Delete_').subscribe(translated => {
      this.delete_translate = translated;
    });
    //saved
    this.translate.get('ChatScreen._Saved_').subscribe(translated => {
      this.saved_translate = translated;
    });
    //failed to save
    this.translate.get('ChatScreen._FailedToSave_').subscribe(translated => {
      this.failed_to_save_transalate = translated;
    });
    //deleted
    this.translate.get('ChatScreen._Deleted_').subscribe(translated => {
      this.deleted_translate = translated;
    });
    //failed to delete
    this.translate.get('ChatScreen._FailedToDelete_').subscribe(translated => {
      this.failed_to_delete_translate = translated;
    });
    //failed to delete
    this.translate.get('ChatScreen._PermissionNotGranted_').subscribe(translated => {
      this.permission_not_granted_translate = translated;
    });
  }

  ionViewDidEnter() {
    this.doTranslate();
    this._file.listDir(this.path, this.folder).then(entries => {
      entries.forEach(entry => {
        if (entry.isFile) {
          let dir = entry.nativeURL;
          dir = dir.substring(0, dir.lastIndexOf('/') + 1);

          entry.getMetadata((metadata) => {
            let type = this.getFileType(entry.name);
            let index = this.files.push({
              dir: dir,
              name: entry.name,
              type: type,
              nativeURL: entry.nativeURL,
              time: metadata.modificationTime.getTime(),
              thumbnail: '',
              uuid: UUID.UUID(),
            });

            this.setThumbnail(index - 1);
          });
        }
      });
      this.filesInitiated = true;
    }).catch(error => {
      this.filesInitiated = true;
    });

  }

  getFileType(name) {
    let mimeType: string = mime.lookup(name);
    return mimeType.substring(0, mimeType.lastIndexOf('/'));
  }

  openFile(file, index) {
    switch (file.type) {
      case 'image':
        this.openImage(file);
        break;

      case 'audio':
        this.openAudio(file);
        break;

      case 'video':
        this.openVideo(file);
        break;
    }
  }

  openImage(file) {
    let element = this._elementRef.nativeElement.querySelector('#message-file-' + file.uuid);
    let image = this._imageViewerController.create(element);
    image.present();

  }

  openAudio(file) {
    let options = {
      successCallback: () => {  },
      errorCallback: (e) => {  },
      shouldAutoClose: true,
      bgImage: 'https://s3-ap-southeast-1.amazonaws.com/eiosys/images/equilizer.gif',
    };
    this.streamingMedia.playAudio(file.nativeURL, options);
  }

  openVideo(file) {
    let options = {
      successCallback: () => { },
      errorCallback: (e) => { },
      shouldAutoClose: true,
    };
    this.streamingMedia.playVideo(file.nativeURL, options);
  }

  takeAction(file, index) {
    let actionSheet = this._actionSheetCtrl.create({
      title: file.name,
      buttons: [
        {
          text: this.delete_translate,
          role: 'destructive',
          handler: () => {
            //deleting file
            this._file.removeFile(file.dir, file.name).then(status => {
              this._events.publish('toast:create', this.deleted_translate);
              this.files.splice(index, 1);
              this._events.publish('message:file:deleted', file.name);
            }).catch(error => {
              this._events.publish('toast:create', this.failed_to_delete_translate);
            })

          }
        }, {
          text: this.save_to_gallery_tranlate,
          handler: () => {
            //saving file
            this.saveToLibrary(file);
          }
        }, {
          text: this.cancel_translate,
          role: 'cancel',
        }
      ]
    });
    actionSheet.present();
  }

  dismiss(data) {
    this._viewController.dismiss();
  }

  isHidden(file) {
    return this.selectedTab.toLowerCase() !== file.type;
  }

  setThumbnail(index) {
    let file = this.files[index];
    let thumbnail = '';

    switch (file.type) {
      case 'image':
        this.files[index].thumbnail = normalizeURL(file.nativeURL);
        break;

      case 'audio':
        this.files[index].thumbnail = 'assets/img/audio-wave.png';
        break;

      case 'video':
        this.files[index].thumbnail = 'assets/img/video.png';

        let options: any = {
          fileUri: file.nativeURL,
          outputFileName: file.name,
          width: 160,
          height: 160,
          quality: 50,
          maintainAspectRatio: true,
        };
        this._videoEditor.createThumbnail(options).then(url => {
          this.files[index].thumbnail = normalizeURL(url);
        }).catch(error => {

        });
    }
  }

  saveToLibrary(file) {
    this._photoLibrary.requestAuthorization().then(() => {

      switch (file.type) {
        case 'image':
          this._photoLibrary.saveImage(file.nativeURL, Global.album).then(status => {
            this._events.publish('toast:create', this.saved_translate);
          }).catch(error => {
            if (error === 'Retrieved asset is nil') {
              this._events.publish('toast:create', this.saved_translate);
            } else {
              this._events.publish('toast:error', this.failed_to_save_transalate);
            }
          });
          break;

        case 'video':
        case 'audio':
          this._photoLibrary.saveVideo(file.nativeURL, Global.album).then(status => {
            this._events.publish('toast:create', this.saved_translate);
          }).catch(error => {
            if (error === 'Retrieved asset is nil') {
              this._events.publish('toast:create', this.saved_translate);
            } else {
              this._events.publish('toast:error', this.failed_to_save_transalate);
            }
          });
          break;
      }
    }).catch(error => {
      this._events.publish('toast:error', this.permission_not_granted_translate);
    });
  }
}
