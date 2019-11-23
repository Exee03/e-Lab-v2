import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase/app';
import 'firebase/analytics';

firebase.initializeApp(environment.firebase);
// firebase.analytics();

import { TextEditorPageModule } from './modal-pages/text-editor/text-editor.module';
import { ImageViewerPageModule } from './modal-pages/image-viewer/image-viewer.module';
import { ReportViewerPageModule } from './modal-pages/report-viewer/report-viewer.module';
import { SelectCoursePageModule } from './modal-pages/select-course/select-course.module';
import { CreateReportPageModule } from './modal-pages/create-report/create-report.module';
import { FileViewerPageModule } from './modal-pages/file-viewer/file-viewer.module';
import { FileViewerPdfPageModule } from './modal-pages/file-viewer-pdf/file-viewer-pdf.module';
import { EditProfilePageModule } from './modal-pages/edit-profile/edit-profile.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    FileViewerPageModule,
    FileViewerPdfPageModule,
    TextEditorPageModule,
    ImageViewerPageModule,
    ReportViewerPageModule,
    SelectCoursePageModule,
    CreateReportPageModule,
    EditProfilePageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
