import { Injectable } from '@angular/core';
import { Subject, Observable, combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Group } from 'src/app/models/group';
import { Course } from 'src/app/models/course';
import { Faculty } from 'src/app/models/faculty';
import { map } from 'rxjs/operators';
import { Report, Header, Data, HeaderData } from 'src/app/models/report';
import { User } from 'src/app/models/user';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  unsubscribe$ = new Subject<void>();
  user$: Observable<User[]>;
  faculty$: Observable<Faculty[]>;
  group$: Observable<Group[]>;
  course$: Observable<Course[]>;
  combineGroupCourse$: Observable<[Group[], Course[]]>;
  reports$: Observable<Report[]>;
  header$: Observable<Header[]>;
  subHeader$: Observable<Header[]>;
  data$: Observable<Data[]>;
  combineHeaderSubHeaderData$: Observable<[Header[], Header[], Data[]]>;

  constructor(
    private afStore: AngularFirestore,
  ) { }

  getAllUser() {
    // tslint:disable-next-line: max-line-length
    this.user$ = this.afStore
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
    return this.user$;
  }

  getAllFaculty() {
    // tslint:disable-next-line: max-line-length
    this.faculty$ = this.afStore
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
    return this.faculty$;
  }

  getAllCourse() {
    // tslint:disable-next-line: max-line-length
    this.course$ = this.afStore
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
    return this.course$;
  }

  getAllGroup() {
    // tslint:disable-next-line: max-line-length
    this.group$ = this.afStore
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
    return this.group$;
  }

  getAllGroupDetail() {
    // tslint:disable-next-line: deprecation
    return this.combineGroupCourse$ = combineLatest(this.getAllGroup(), this.getAllCourse());
  }

  getAllReportBySubmit() {
    this.reports$ = this.afStore
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
    return this.reports$;
  }

  getReportByUser(userUid: string) {
    this.reports$ = this.afStore
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
    return this.reports$;
  }

  getHeader(reportUid: string) {
    // tslint:disable-next-line: max-line-length
    this.header$ = this.afStore.collection('report').doc(reportUid).collection('header', ref => ref.orderBy('id', 'asc')).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Header;
        data.uid = a.payload.doc.id;
        data.isExpanded = false;
        data.isEdit = false;
        return data;
      });
    }));
    return this.header$;
  }

  getSubHeader(reportUid: string) {
    // tslint:disable-next-line: max-line-length
    this.subHeader$ = this.afStore.collection('report').doc(reportUid).collection('subHeader', ref => ref.orderBy('id', 'asc')).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Header;
        data.uid = a.payload.doc.id;
        data.isExpanded = false;
        data.isEdit = false;
        return data;
      });
    }));
    return this.subHeader$;
  }

  getData(reportUid: string) {
    // tslint:disable-next-line: max-line-length
    this.data$ = this.afStore.collection('report').doc(reportUid).collection('data').snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Data;
        data.uid = a.payload.doc.id;
        return data;
      });
    }));
    return this.data$;
  }

  getReportData(reportUid: string) {
    // tslint:disable-next-line: max-line-length
    return this.combineHeaderSubHeaderData$ = combineLatest(this.getHeader(reportUid), this.getSubHeader(reportUid), this.getData(reportUid));
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
    return this.afStore.collection('report').doc(reportUid).update(data);
  }

  deleteReport(reportUid: string) {
    return this.afStore.collection('report').doc(reportUid).delete();
  }

  addHeader(reportUid: string, data: Header) {
    return this.afStore.collection('report').doc(reportUid).collection('header').add(data);
  }

  updateHeader(reportUid: string, headerUid: string, data: Header) {
    return this.afStore.collection('report').doc(reportUid).collection('header').doc(headerUid).set(data, {merge: true});
  }

  deleteHeader(reportUid: string, headerUid: string) {
    return this.afStore.collection('report').doc(reportUid).collection('header').doc(headerUid).delete();
  }

  deleteHeaderDataField(reportUid: string, headerUid: string) {
    // tslint:disable-next-line: max-line-length
    return this.afStore.collection('report').doc(reportUid).collection('header').doc(headerUid).update({data: firebase.firestore.FieldValue.delete()});
  }

  addSubHeader(reportUid: string, data: Header) {
    return this.afStore.collection('report').doc(reportUid).collection('subHeader').add(data);
  }

  updateSubHeader(reportUid: string, subHeaderUid: string, data: Header) {
    return this.afStore.collection('report').doc(reportUid).collection('subHeader').doc(subHeaderUid).set(data, {merge: true});
  }

  deleteSubHeader(reportUid: string, subHeaderUid: string) {
    return this.afStore.collection('report').doc(reportUid).collection('subHeader').doc(subHeaderUid).delete();
  }

  addData(reportUid: string, data: Data) {
    return this.afStore.collection('report').doc(reportUid).collection('data').add(data);
  }

  updateData(reportUid: string, dataUid: string, data: Data) {
    return this.afStore.collection('report').doc(reportUid).collection('data').doc(dataUid).set(data, {merge: true});
  }

  deleteData(reportUid: string, dataUid: string) {
    return this.afStore.collection('report').doc(reportUid).collection('data').doc(dataUid).delete();
  }
}
