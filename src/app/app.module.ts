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
import * as firebase from 'firebase';

firebase.initializeApp(environment.firebase);
firebase.analytics();

import { FileViewPageModule } from './modal-pages/file-view/file-view.module';
import { TextEditorPageModule } from './modal-pages/text-editor/text-editor.module';
import { ImageViewerPageModule } from './modal-pages/image-viewer/image-viewer.module';
import { ReportViewerPageModule } from './modal-pages/report-viewer/report-viewer.module';
import { SelectCoursePageModule } from './modal-pages/select-course/select-course.module';
import { CreateReportPageModule } from './modal-pages/create-report/create-report.module';

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
    FileViewPageModule,
    TextEditorPageModule,
    ImageViewerPageModule,
    ReportViewerPageModule,
    SelectCoursePageModule,
    CreateReportPageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
