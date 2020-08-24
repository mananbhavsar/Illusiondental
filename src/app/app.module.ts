import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { Badge } from '@ionic-native/badge';
import { CallNumber } from '@ionic-native/call-number';
import { Camera } from '@ionic-native/camera';
import { Device } from '@ionic-native/device';
import { Diagnostic } from '@ionic-native/diagnostic';
import { EmailComposer } from '@ionic-native/email-composer';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Globalization } from '@ionic-native/globalization';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
import { Media } from '@ionic-native/media';
import { MediaCapture } from '@ionic-native/media-capture';
import { Network } from '@ionic-native/network';
import { OneSignal } from '@ionic-native/onesignal';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { StatusBar } from '@ionic-native/status-bar';
import { StreamingMedia } from '@ionic-native/streaming-media';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Vibration } from '@ionic-native/vibration';
import { VideoCapturePlus } from '@ionic-native/video-capture-plus';
import { VideoEditor } from '@ionic-native/video-editor';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MomentModule } from 'angular2-moment';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { ElasticModule } from 'ng-elastic';
import { OrderModule } from 'ngx-order-pipe';
import { AboutPageModule } from '../pages/about/about.module';
import { AccountPageModule } from '../pages/account/account.module';
import { ChangePasswordPageModule } from "../pages/account/change-password/change-password.module";
import { EditProfilePageModule } from "../pages/account/edit-profile/edit-profile.module";
import { NotificationPreferencesPageModule } from "../pages/account/notification-preferences/notification-preferences.module";
import { AlignersPageModule } from '../pages/aligners/aligners.module';
import { CaseStatusModalPageModule } from "../pages/case-status/case-status-modal/case-status-modal.module";
import { CaseStatusPageModule } from "../pages/case-status/case-status.module";
import { ChatReadModalPageModule } from "../pages/chat/chat-read-modal/chat-read-modal.module";
import { ChatPageModule } from "../pages/chat/chat.module";
import { SavedMediaPageModule } from "../pages/chat/saved-media/saved-media.module";
import { CommunicationPageModule } from "../pages/communication/communication.module";
import { ContactUsPageModule } from '../pages/contact-us/contact-us.module';
import { DashboardPageModule } from "../pages/dashboard/dashboard.module";
import { DisclaimerPageModule } from '../pages/disclaimer/disclaimer.module';
import { ForgotPasswordPageModule } from '../pages/forgot-password/forgot-password.module';
import { HelpPageModule } from '../pages/help/help.module';
import { HomePageModule } from '../pages/home/home.module';
import { InvoicePageModule } from '../pages/invoice/invoice.module';
import { LoginPageModule } from '../pages/login/login.module';
import { OfficeListPageModule } from "../pages/office-list/office-list.module";
import { OfflinePageModule } from '../pages/offline/offline.module';
import { PaymentsPageModule } from "../pages/payments/payments.module";
import { PickupPageModule } from "../pages/pickup/pickup.module";
import { SearchPageModule } from '../pages/search/search.module';
import { TutorialPageModule } from '../pages/tutorial/tutorial.module';
import { UserStatusPageModule } from '../pages/user-status/user-status.module';
import { WelcomePageModule } from '../pages/welcome/welcome.module';
import { PipesModule } from "../pipes/pipes.module";
import { CommonProvider } from "../providers/common/common";
import { ConnectionProvider } from '../providers/connection/connection';
import { FileOpsProvider } from '../providers/file-ops/file-ops';
import { FirebaseTransactionProvider } from '../providers/firebase-transaction/firebase-transaction';
import { NotificationsProvider } from "../providers/notifications/notifications";
import { OfficeServiceProvider } from '../providers/office-service/office-service';
import { OfflineStorageProvider } from '../providers/offline-storage/offline-storage';
import { UserProvider } from '../providers/user/user';
import { FeedbackPageModule } from './../pages/feedback/feedback.module';
import { MyApp } from './app.component';







export const firebaseConfig = {
    apiKey: "AIzaSyAeAsx1UOrRVQ9m9zlwvmHiTsCuvLtO-J4",
    authDomain: "illusion-dental-5d48c.firebaseapp.com",
    databaseURL: "https://illusion-dental-5d48c-84139.firebaseio.com",
    projectId: "illusion-dental-5d48c",
    storageBucket: "illusion-dental-5d48c.appspot.com",
    messagingSenderId: "7402421237",
}

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        MyApp,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp, {
            mode: 'md',
        }),
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        HttpModule,
        IonicStorageModule.forRoot({
            name: '__dental_illusion_db',
            driverOrder: ['indexeddb', 'sqlite', 'websql']
        }),
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        IonicImageViewerModule,
        AboutPageModule,
        FeedbackPageModule,
        AccountPageModule,
        AlignersPageModule,
        CaseStatusPageModule,
        CaseStatusModalPageModule,
        ChangePasswordPageModule,
        ChatPageModule,
        ChatReadModalPageModule,
        DisclaimerPageModule,
        CommunicationPageModule,
        ContactUsPageModule,
        DashboardPageModule,
        EditProfilePageModule,
        ForgotPasswordPageModule,
        HelpPageModule,
        HomePageModule,
        InvoicePageModule,
        LoginPageModule,
        NotificationPreferencesPageModule,
        OfficeListPageModule,
        OfflinePageModule,
        PaymentsPageModule,
        PickupPageModule,
        SavedMediaPageModule,
        SearchPageModule,
        TutorialPageModule,
        UserStatusPageModule,
        WelcomePageModule,
        MomentModule,
        ElasticModule,
        OrderModule,
        PipesModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        ConnectionProvider,
        UserProvider,
        OfficeServiceProvider,
        AngularFireDatabase,
        FirebaseTransactionProvider,
       Network,
        StatusBar,
        Keyboard,
        OneSignal,
        SplashScreen,
        Diagnostic,
        SQLite,
        EmailComposer,
        Badge,
        Device,
        CallNumber,
        InAppBrowser,
        FileTransfer,
        File,
        FileChooser,
        MediaCapture,
        Media,
        Vibration,
        VideoCapturePlus,
        StreamingMedia,
        VideoEditor,
        UniqueDeviceID,
        PhotoLibrary,
        Globalization,
        CommonProvider,
        NotificationsProvider,
        FileOpener,
        FileOpsProvider,
        PhotoViewer,
        Camera,   
        OfflineStorageProvider,

    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
