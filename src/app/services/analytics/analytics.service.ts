import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/database';
import { Analytic } from 'src/app/models/analytic';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  listEvent: Analytic[] = [];
  userUid = '';
  constructor(
    private storage: Storage,
  ) {
  }

  initFirebaseAnalytic(userUid: string) {
    this.userUid = userUid;
    firebase.analytics().setUserId(userUid);
  }

  init() {
    this.storage.get('analytic').then(res => {
      if (res) {
        this.listEvent = res;
      }
    });
  }

  dispose() {
    this.listEvent = [];
    this.storage.remove('analytic');
  }

  logEvent(event: string, isDone: boolean, dataEvent: string = '') {
    const newData: Analytic =
      dataEvent === '' ? { event, isDone } : { event, isDone, dataEvent };
    if (this.userUid !== '') {
      newData.userUid = this.userUid;
    }
    if (isDone) {
      this.listEvent.forEach(e => {
        if (e.event === event) {
          e.isDone = isDone;
          e.stop = Date.now();
          if (dataEvent !== '') {
            e.dataEvent = dataEvent;
          }
          // firebase.database().ref().push(e);
          firebase.analytics().logEvent(e.event, e);
        }
      });
      this.removeFromList();
    } else {
      newData.start = Date.now();
      let isSame = false;
      this.listEvent.forEach(e => {
        if (e.event === event) {
          e.start = Date.now();
          isSame = true;
        }
      });
      if (!isSame) { this.listEvent.push(newData); }
    }
    this.storage.set('analytic', this.listEvent);
  }

  private removeFromList() {
    // console.log('Before :', this.listEvent);
    const removeIndex = this.listEvent.map((item) => item.isDone).indexOf(true);
    this.listEvent.splice(removeIndex, 1);
    // console.log('After :', this.listEvent);
  }
}
