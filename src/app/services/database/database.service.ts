import { Injectable } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Group } from 'src/app/models/group';
import { Course } from 'src/app/models/course';
import { Faculty } from 'src/app/models/faculty';
import { map, first } from 'rxjs/operators';
import { Report, Header, Data } from 'src/app/models/report';
import { User } from 'src/app/models/user';
import * as firebase from 'firebase/app';
import { Evaluate, Files } from 'src/app/models/files';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  unsubscribe$ = new Subject<void>();

  constructor(private afStore: AngularFirestore) {}

  getAllUser() {
    return this.afStore
      .collection('users')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as User;
            data.uid = a.payload.doc.id;
            return data;
          });
        })
      );
  }

  getAllFaculty() {
    return this.afStore
      .collection('faculty')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Faculty;
            data.uid = a.payload.doc.id;
            return data;
          });
        })
      );
  }

  getAllCourse() {
    return this.afStore
      .collection('course')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Course;
            data.uid = a.payload.doc.id;
            return data;
          });
        })
      );
  }

  getAllGroup() {
    return this.afStore
      .collection('group')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Group;
            data.uid = a.payload.doc.id;
            return data;
          });
        })
      );
  }

  getAllGroupDetail() {
    // tslint:disable-next-line: deprecation
    return combineLatest(this.getAllGroup(), this.getAllCourse());
  }

  getEvaluation(evaluateUid: string) {
    return this.afStore
      .collection('evaluate')
      .doc<Evaluate>(evaluateUid)
      .valueChanges()
      .pipe(first());
  }

  getAllReportBySubmit() {
    return this.afStore
      .collection('report', ref => ref.where('submit', '==', true))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Report;
            return data;
          });
        })
      );
  }

  getReportByUser(userUid: string) {
    return this.afStore
      .collection('report', ref => ref.where('user', '==', userUid))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Report;
            return data;
          });
        })
      );
  }

  getHeader(reportUid: string) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('header', ref => ref.orderBy('id', 'asc'))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Header;
            data.uid = a.payload.doc.id;
            data.isExpanded = false;
            data.isEdit = false;
            return data;
          });
        })
      );
  }

  getSubHeader(reportUid: string) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('subHeader', ref => ref.orderBy('id', 'asc'))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Header;
            data.uid = a.payload.doc.id;
            data.isExpanded = false;
            data.isEdit = false;
            return data;
          });
        })
      );
  }

  getData(reportUid: string) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('data')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Data;
            data.uid = a.payload.doc.id;
            return data;
          });
        })
      );
  }

  getReportData(reportUid: string) {
    // tslint:disable-next-line: deprecation
    return combineLatest(
      this.getHeader(reportUid),
      this.getSubHeader(reportUid),
      this.getData(reportUid)
    );
  }

  getReportDataWithEvaluate(report: Report) {
    // tslint:disable-next-line: deprecation
    return combineLatest(
      this.getHeader(report.uid),
      this.getSubHeader(report.uid),
      this.getData(report.uid),
      this.getEvaluation(report.evaluate)
    );
  }

  getDummyReport() {
    return this.afStore
      .collection('report', ref => ref.where('title', '==', 'Dummy'))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Report;
            return data;
          });
        })
      );
  }

  addReport(data: Report) {
    return this.afStore.collection('report').add(data);
  }

  updateReport(reportUid: string, data: Report) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .update(data);
  }

  deleteReport(reportUid: string) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .delete();
  }

  addHeader(reportUid: string, data: Header) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('header')
      .add(data);
  }

  updateHeader(reportUid: string, headerUid: string, data: Header) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('header')
      .doc(headerUid)
      .set(data, { merge: true });
  }

  deleteHeader(reportUid: string, headerUid: string) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('header')
      .doc(headerUid)
      .delete();
  }

  deleteHeaderDataField(reportUid: string, headerUid: string) {
    // tslint:disable-next-line: max-line-length
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('header')
      .doc(headerUid)
      .update({ data: firebase.firestore.FieldValue.delete() });
  }

  addSubHeader(reportUid: string, data: Header) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('subHeader')
      .add(data);
  }

  updateSubHeader(reportUid: string, subHeaderUid: string, data: Header) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('subHeader')
      .doc(subHeaderUid)
      .set(data, { merge: true });
  }

  deleteSubHeader(reportUid: string, subHeaderUid: string) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('subHeader')
      .doc(subHeaderUid)
      .delete();
  }

  addData(reportUid: string, data: Data) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('data')
      .add(data);
  }

  updateData(reportUid: string, dataUid: string, data: Data) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('data')
      .doc(dataUid)
      .set(data, { merge: true });
  }

  deleteData(reportUid: string, dataUid: string) {
    return this.afStore
      .collection('report')
      .doc(reportUid)
      .collection('data')
      .doc(dataUid)
      .delete();
  }

  getAllRubric() {
    return this.afStore
      .collection('rubric')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Files;
            return data;
          });
        })
      );
  }

  getAllManual() {
    return this.afStore
      .collection('manual')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Files;
            return data;
          });
        })
      );
  }

  getAllSchedule() {
    return this.afStore
      .collection('schedule')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Files;
            return data;
          });
        })
      );
  }

  getAllReference() {
    return this.afStore
      .collection('reference')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Files;
            return data;
          });
        })
      );
  }

  getAllFile() {
    // tslint:disable-next-line: deprecation
    return combineLatest(
      this.getAllRubric(),
      this.getAllManual(),
      this.getAllSchedule(),
      this.getAllReference()
    );
  }

  updateRubric(data: Files) {
    return this.afStore.collection('rubric').doc(data.uid).update(data);
  }

  updateManual(data: Files) {
    return this.afStore.collection('manual').doc(data.uid).update(data);
  }

  updateSchedule(data: Files) {
    return this.afStore.collection('schedule').doc(data.uid).update(data);
  }

  updateReference(data: Files) {
    return this.afStore.collection('reference').doc(data.uid).update(data);
  }
}
