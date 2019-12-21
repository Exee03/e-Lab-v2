import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Report, Header, Data, HeaderData } from 'src/app/models/report';
import { DatabaseService } from '../database/database.service';
import { takeUntil, finalize, first } from 'rxjs/operators';
import { GroupDetail, Group } from 'src/app/models/group';
import { CommonService } from '../common/common.service';
import { Storage } from '@ionic/storage';
import { AngularFireStorage } from '@angular/fire/storage';
import { Evaluate } from 'src/app/models/files';
import { Router } from '@angular/router';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  unsubscribeReport$ = new Subject<void>();
  reports = new BehaviorSubject<Report[]>([]);
  header: Header[] = [];
  subHeader: Header[] = [];
  data: Data[] = [];
  downloadURL = new BehaviorSubject<string>(null);
  selectedReport: Report;
  evaluation: Evaluate;
  isGettingData = new BehaviorSubject(false);
  selectedGroupDetail: GroupDetail;

  constructor(
    private databaseService: DatabaseService,
    private commonService: CommonService,
    private analyticService: AnalyticsService,
    private storage: Storage,
    private router: Router,
    private afStorage: AngularFireStorage
  ) { }

  getGroupDetail(groupUid: string) {
    return this.selectedGroupDetail = this.commonService.groupDetails.value.find(gd => gd.uid === groupUid);
  }

  getReportData(reportUid: string) {
    this.selectedReport = this.reports.value.find(r => r.uid === reportUid);
    if (this.selectedReport) {
      this.getGroupDetail(this.selectedReport.group);
    }
    return this.databaseService.getReportData(reportUid).pipe(takeUntil(this.unsubscribeReport$)).subscribe(data => {
      this.header = data[0];
      this.subHeader = data[1];
      this.data = data[2];
    });
  }

  async getEvaluation(reportUid: string) {
    this.selectedReport = this.reports.value.find(r => r.uid === reportUid);
    if (this.selectedReport) {
      this.getGroupDetail(this.selectedReport.group);
    }
    return this.databaseService.getReportDataWithEvaluate(this.selectedReport).subscribe(data => {
      if (data) {
        this.header = data[0];
        this.subHeader = data[1];
        this.data = data[2];
        this.evaluation = data[3];
        this.router.navigate(['my-report-detail']).finally(() => this.analyticService.logEvent('view-mark', true));
      }
    });
  }

  addReport( title: string, courseUid: string, groupUid: string, userUid: string) {
    const data: Report = {
      course: courseUid,
      user: userUid,
      title,
      group: groupUid,
      submit: false,
      lastEdit: this.commonService.getTime()
    };
    return this.databaseService.addReport(data).then(report => {
      this.databaseService.updateReport(report.id, {uid: report.id});
      this.storage.set('report-token', report.id);
      this.analyticService.logEvent('create-report', true);
    });
  }

  addHeader(reportUid: string, nameHeader: string, indexCurrent: number) {
    this.commonService.showToast('Adding header...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const data: Header = {
      id: ++indexCurrent,
      name: nameHeader
    };
    this.databaseService.addHeader(reportUid, data).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('add-header', true);
    });
    // this.analyticsService.logEvent('addHeader-done', {method: nameHeader});
  }

  async addSubHeader(reportUid: string, nameHeader: string, headerData: HeaderData[], headerUid: string) {
    this.commonService.showToast('Adding sub-header...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    let index = 1;
    if (headerData) {
      index = headerData.length + 1;
    }
    const data: Header = {
      id: index,
      name: nameHeader
    };
    const subHeaderDoc = await this.databaseService.addSubHeader(reportUid, data);
    let dataArray = [];
    if (headerData) {
      dataArray = headerData as HeaderData[];
    }
    dataArray.push({
      id: index,
      sub: true,
      uid: subHeaderDoc.id
    });
    const docData: Header = {
      data: dataArray
    };
    this.databaseService.updateHeader(reportUid, headerUid, docData).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('add-subHeader', true);
    });
    // this.analyticsService.logEvent('addSubHeader-done', {method: nameHeader});
    return subHeaderDoc.id;
  }

  async addHeaderData(reportUid: string, data: string, type: string, header: Header) {
    this.commonService.showToast('Adding header data...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()}).catch(e => console.log(e));
    const container: Data = {
      data,
      type
    };
    // tslint:disable-next-line: no-string-literal
    const headerData: HeaderData[] = header.data;
    let dataLength = 0;
    if (headerData !== undefined) {
      dataLength = headerData.length;
    } else {
      dataLength = 0;
    }
    const index = dataLength + 1;
    const headerDataDoc = await this.databaseService.addData(reportUid, container);

    const dataArray = [];
    if (headerData) {
      headerData.forEach((element: HeaderData) => {
        dataArray.push({
          id: element.id,
          sub: element.sub,
          uid: element.uid
        });
      });
    }
    dataArray.push({
      id: index,
      sub: false,
      uid: headerDataDoc.id
    });
    const docData: Header = {
      data: dataArray
    };
    // tslint:disable-next-line: no-string-literal
    this.databaseService.updateHeader(reportUid, header.uid, docData);
    const containerUpdated: Data = {
      uid: headerDataDoc.id
    };
    this.databaseService.updateData(reportUid, headerDataDoc.id, containerUpdated).finally(() => {
      this.isGettingData.next(false);
      if (type === 'text') { this.analyticService.logEvent('add-text-header', true); }
    });
    return headerDataDoc.id;
  }

  updateAdditionalData(reportUid: string, dataUid: string, url: string) {
    this.databaseService.updateData(reportUid, dataUid, {data: url});
    this.isGettingData.next(false);
  }

  async addSubHeaderData(reportUid: string, data: string, type: string, subHeader: Header) {
    this.commonService.showToast('Adding sub-header data...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const container: Data = {
      data,
      type
    };
    // tslint:disable-next-line: no-string-literal
    const headerData: HeaderData[] = subHeader.data;
    let dataLength = 0;
    if (headerData !== undefined) {
      dataLength = headerData.length;
    } else {
      dataLength = 0;
    }
    const index = dataLength + 1;
    const subHeaderDataDoc = await this.databaseService.addData(reportUid, container);

    const dataArray = [];
    if (headerData) {
      headerData.forEach((element: HeaderData) => {
        dataArray.push({
          id: element.id,
          sub: element.sub,
          uid: element.uid
        });
      });
    }
    dataArray.push({
      id: index,
      sub: false,
      uid: subHeaderDataDoc.id
    });
    const docData: Header = {
      data: dataArray
    };
    // tslint:disable-next-line: no-string-literal
    this.databaseService.updateSubHeader(reportUid, subHeader.uid, docData);
    const containerUpdated: Data = {
      uid: subHeaderDataDoc.id
    };
    this.databaseService.updateData(reportUid, subHeaderDataDoc.id, containerUpdated).finally(() => {
      this.isGettingData.next(false);
      if (type === 'text') { this.analyticService.logEvent('add-text-subHeader', true); }
    });
    return subHeaderDataDoc.id;
  }

  editReport(reportUid: string, title: string) {
    this.commonService.showToast('Updating report...');
    // tslint:disable-next-line: max-line-length
    this.databaseService.updateReport(reportUid, {title, lastEdit: this.commonService.getTime()}).finally(() => this.isGettingData.next(false));
    // this.analyticsService.logEvent('createReport-done', {method: 'rename'});
  }

  editHeader(reportUid: string, nameHeader: string, headerUid: string) {
    this.commonService.showToast('Updating header...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const data: Header = {
      name: nameHeader
    };
    this.databaseService.updateHeader(reportUid, headerUid, data).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('edit-header', true);
    });
    // this.analyticsService.logEvent('editHeader-done', {method: headerUid});
  }

  editSubHeader(reportUid: string, nameSubHeader: string, subHeaderUid: string) {
    this.commonService.showToast('Updating sub-header...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const data: Header = {
      name: nameSubHeader
    };
    this.databaseService.updateSubHeader(reportUid, subHeaderUid, data).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('edit-subHeader', true);
    });
    // this.analyticsService.logEvent('editSubHeader-done', {method: subHeaderUid});
  }

  editData(reportUid: string, newData: string, data: Data) {
    this.commonService.showToast('Updating data...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const container: Data = {
      data: newData
    };
    this.databaseService.updateData(reportUid, data.uid, container).finally(() => {
      this.isGettingData.next(false);
      if (data.type === 'text') { this.analyticService.logEvent('edit-text', true); }
    });
  }

  deleteReport(reportUid: string) {
    if (this.header.length !== 0) {
      this.header.forEach(header => {
        this.deleteHeader(reportUid, this.header, header.uid);
      });
    }
    this.databaseService.deleteReport(reportUid);
  }

  deleteReportInstant(reportUid: string) {
    this.commonService.showToast('Deleting report...');
    this.selectedReport = this.reports.value.find(r => r.uid === reportUid);
    return this.databaseService.getReportData(reportUid)
    .pipe(
      first(),
      finalize(() => {
        this.header.forEach(header => {
          this.databaseService.deleteHeader(reportUid, header.uid);
        });
        this.subHeader.forEach(subHeader => {
          this.databaseService.deleteSubHeader(reportUid, subHeader.uid);
        });
        this.data.forEach(data => {
          if (data.type === 'image') {
            this.databaseService.deleteDataStorage(reportUid, data.uid);
          }
          this.databaseService.deleteData(reportUid, data.uid);
        });
        if (this.selectedReport.evaluate !== undefined) {
          this.databaseService.deleteEvaluation(this.selectedReport.evaluate);
        }
        this.databaseService.deleteReport(reportUid);
        this.commonService.showToast('Successfully delete your report');
      })
      ).subscribe(data => {
        this.header = data[0];
        this.subHeader = data[1];
        this.data = data[2];
    });
  }

  deleteHeader(reportUid: string, headers: Header[], headerUid: string) {
    this.commonService.showToast('Deleting header...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    let index = 0;
    headers.forEach(header => {
      if (header.uid !== headerUid) {
        index += 1;
        this.databaseService.updateHeader(reportUid, header.uid, {id: index});
      } else {
        if (header.data !== undefined) {
          header.data.forEach(headerData => {
            if (headerData.sub) {
              this.subHeader.forEach(subHeader => {
                if (subHeader.uid === headerData.uid) {
                  if (subHeader.data !== undefined) {
                    this.deleteAllData(reportUid, subHeader.data);
                  }
                }
              });
              this.databaseService.deleteSubHeader(reportUid, headerData.uid);
            } else {
              if (headerData.type === 'image') {
                this.databaseService.deleteDataStorage(reportUid, headerData.uid);
              }
              this.databaseService.deleteData(reportUid, headerData.uid);
            }
          });
        }
      }
    });
    this.databaseService.deleteHeader(reportUid, headerUid).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('delete-header', true);
    });
  }

  deleteSubHeader(reportUid: string, headerUid: string, headerData: HeaderData[], subHeaderUid: string, subHeaderData: HeaderData[]) {
    this.commonService.showToast('Deleting sub-header...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const dataArray = [];
    let index = 0;
    // tslint:disable-next-line: no-shadowed-variable
    headerData.forEach(data => {
      if (data.uid !== subHeaderUid) {
        index += 1;
        dataArray.push({
          id: index,
          sub: data.sub,
          uid: data.uid
        });
        if (data.sub) {
          this.databaseService.updateSubHeader(reportUid, data.uid, {id: index});
        }
      }
    });
    const docData: Header = {
      data: dataArray
    };
    this.databaseService.deleteHeaderDataField(reportUid, headerUid).then(() => {
      this.databaseService.updateHeader(reportUid, headerUid, docData);
      this.databaseService.deleteSubHeader(reportUid, subHeaderUid).finally(() => {
        this.isGettingData.next(false);
        this.analyticService.logEvent('delete-subHeader', true);
      });
      if (subHeaderData !== undefined) {
        this.deleteAllData(reportUid, subHeaderData);
      }
    });
  }

  deleteHeaderData(reportUid: string, headerId: string, dataUid: string, headerData: HeaderData[]) {
    this.commonService.showToast('Deleting header data...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const dataArray = [];
    let index = 0;
    headerData.forEach(data => {
      if (data.uid !== dataUid) {
        index += 1;
        dataArray.push({
          id: index,
          sub: data.sub,
          uid: data.uid
        });
        if (data.sub) {
          this.databaseService.updateSubHeader(reportUid, data.uid, {id: index});
        }
      } else {
        if (data.type === 'image') {
          const filePath = `report/${reportUid}/${dataUid}.png`;
          this.afStorage.ref(filePath).delete();
        }
      }
    });
    const docData: Header = {
      data: dataArray
    };
    this.databaseService.updateHeader(reportUid, headerId, docData);
    this.databaseService.deleteData(reportUid, dataUid).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('delete-data-header', true);
    });
  }

  deleteSubHeaderData(reportUid: string, subHeaderId: string, dataUid: string, subHeaderData: HeaderData[]) {
    this.commonService.showToast('Deleting sub-header data...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    const dataArray = [];
    let index = 0;
    subHeaderData.forEach(data => {
      if (data.uid !== dataUid) {
        index += 1;
        dataArray.push({
          id: index,
          sub: data.sub,
          uid: data.uid
        });
      } else {
        if (data.type === 'image') {
          const filePath = `report/${reportUid}/${dataUid}.png`;
          this.afStorage.ref(filePath).delete();
        }
      }
    });
    this.databaseService.updateSubHeader(reportUid, subHeaderId, {data: dataArray});
    this.databaseService.deleteData(reportUid, dataUid).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('delete-data-subHeader', true);
    });
  }

  deleteAllData(reportUid: string, headerData: HeaderData []) {
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    headerData.forEach(data => {
      if (data.type === 'image') {
        this.databaseService.deleteDataStorage(reportUid, data.uid);
      }
      this.databaseService.deleteData(reportUid, data.uid);
    });
  }

  updateOrderHeader(reportUid: string, newHeaders: Header[]) {
    this.commonService.showToast('Ordering header...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    newHeaders.forEach(header => {
      this.databaseService.updateHeader(reportUid, header.uid, {id: header.id});
    });
    this.isGettingData.next(false);
    this.analyticService.logEvent('reorder-header', true);
  }

  updateOrderHeaderData(reportUid: string, newHeaderData: HeaderData[], headerUid: string) {
    this.commonService.showToast('Ordering header data...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    newHeaderData.forEach((data: HeaderData) => {
      if (data.sub === true) {
        this.databaseService.updateSubHeader(reportUid, data.uid, {id: data.id});
      }
    });
    this.databaseService.updateHeader(reportUid, headerUid, {data: newHeaderData}).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('reorder-data-header', true);
    });
  }

  updateOrderSubHeaderData(reportUid: string, newSubHeaderData: HeaderData[], subHeaderUid: string) {
    this.commonService.showToast('Ordering sub-header data...');
    this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime()});
    this.databaseService.updateSubHeader(reportUid, subHeaderUid, {data: newSubHeaderData}).finally(() => {
      this.isGettingData.next(false);
      this.analyticService.logEvent('reorder-data-subHeader', true);
    });
  }

  storeImage(reportUid: string, file: string, dataUid: string) {
    const filePath = `report/${reportUid}/${dataUid}.png`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(async () => {
        const url = await fileRef.getDownloadURL().toPromise();
        this.updateAdditionalData(reportUid, dataUid, url);
        this.commonService.loading(true, 'writing-uploadImage');
        this.analyticService.logEvent('add-image', true);
        this.isGettingData.next(false);
      } )
    ).subscribe();
  }

  submitReport(reportUid: string) {
    return this.databaseService.updateReport(reportUid, {lastEdit: this.commonService.getTime(), submit: true}).finally(() => {
      // tslint:disable-next-line: max-line-length
      this.commonService.showAlert('Successful', '', 'Your report is successfully upload. Now you can see your report status in the My Report.');
      this.analyticService.logEvent('submit-report', true);
    });
  }
}
