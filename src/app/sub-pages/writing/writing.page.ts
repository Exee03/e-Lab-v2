import { Component, OnInit, Input, Renderer2, OnDestroy } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Report, Header, HeaderData, Data } from 'src/app/models/report';
import { CommonService } from 'src/app/services/common/common.service';
import { ModalController, IonItemSliding } from '@ionic/angular';
import { StudentService } from 'src/app/services/student/student.service';
import { Storage } from '@ionic/storage';
import { ImageViewerPage } from 'src/app/modal-pages/image-viewer/image-viewer.page';
import { ReportViewerPage } from 'src/app/modal-pages/report-viewer/report-viewer.page';
import { TextEditorPage } from 'src/app/modal-pages/text-editor/text-editor.page';
import { takeUntil, first } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-writing',
  templateUrl: './writing.page.html',
  styleUrls: ['./writing.page.scss'],
})
export class WritingPage implements OnInit, OnDestroy {
  // tslint:disable-next-line: no-input-rename
  @Input('title') title: any;
  lastX: any;
  image: SafeResourceUrl;
  addingHeader = false;
  addingSubHeader = false;
  user: User;
  nameHeader = '';
  nameSubHeader = '';

  report: Report;
  header: Header[];
  headerData: HeaderData[];
  subHeader: Header[];
  subHeaderData: HeaderData[];
  data: Data[];

  // userGroupDetail: GroupDetail;
  reportUid: string;
  reportTitle = 'New Report';
  // userGroup = '';
  isNative = false;
  // unsubscribeReport$ = new Subject<void>();
  // firstFetch = true;
  doneHeader = false;
  doneSubHeader = false;

  constructor(
    private renderer: Renderer2,
    private commonService: CommonService,
    private modalController: ModalController,
    private storage: Storage,
    private studentService: StudentService,
    private authService: AuthenticationService,
    private analyticService: AnalyticsService
    ) {
      this.authService.user$.pipe(first()).subscribe(user => this.user = user);
      this.getToken();
    }

  ngOnInit() {
    this.studentService.isGettingData.pipe(takeUntil(this.studentService.unsubscribeReport$)).subscribe(getData => {
      if (!getData && this.reportUid) {
        this.refresh();
      }
    });
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.studentService.unsubscribeReport$.next();
    this.studentService.unsubscribeReport$.complete();
    if (this.studentService.header.length === 0) {
      this.commonService.showToast('Deleting empty report ...');
      this.studentService.deleteReport(this.reportUid);
    }
    this.storage.remove('report-token');
    this.reportUid = null;
  }

  getToken() {
    return this.storage.get('report-token').then(token => {
      if (token) {
        this.reportUid = token;
        this.fetchReportData(token);
      }
    });
  }

  refresh() {
    this.fetchReportData(this.reportUid);
  }

  fetchReportData(reportUid: string) {
    this.studentService.getReportData(reportUid);
    setTimeout(() => {
      this.header = this.studentService.header;
      this.report = this.studentService.selectedReport;
      this.reportTitle = this.report.title;
      if (this.header.length !== 0) {
        this.commonService.showToast('Refreshing...');
        this.studentService.isGettingData.next(true);
      } else {
        this.studentService.isGettingData.next(false);
      }
    }, 1000);
  }

  addHeader() {
    console.log('addHeader');
    if (!this.addingHeader) {
      this.addingHeader = true;
    } else {
      this.addingHeader = false;
    }
  }

  addSubHeader() {
    console.log('addSubHeader');
    if (!this.addingSubHeader) {
      this.addingSubHeader = true;
    } else {
      this.addingSubHeader = false;
    }
  }

  saveHeader() {
    console.log('saveHeader');
    this.analyticService.logEvent('add-header', false);
    const { nameHeader } = this;
    let headerLength = 0;
    if (this.header !== undefined) {
      headerLength = this.header.length;
    }
    this.studentService.addHeader(this.reportUid, nameHeader, headerLength);
    this.addingHeader = false;
    this.nameHeader = '';
  }

  saveSubHeader(i) {
    console.log('saveSubHeader');
    this.analyticService.logEvent('add-subHeader', false);
    const index = i - 1;
    const { nameSubHeader } = this;
    const headerId = this.header[index].uid;
    this.studentService.addSubHeader(
      this.reportUid,
      nameSubHeader,
      this.headerData,
      headerId
    );
    this.addingSubHeader = false;
    this.nameSubHeader = '';
  }

  openHeader(i) {
    console.log('openHeader');
    const index = i - 1;
    this.headerData = this.header[index].data;
    if (this.headerData) {
      this.headerData.forEach(data => {
        if (data.sub) {
          this.subHeader = this.studentService.subHeader;
        } else {
          const newData = this.studentService.data.filter(d => d.uid === data.uid);
          newData.map((item: Data) => {
            data.data = item.data;
            data.type = item.type;
          });
        }
      });
    }
    this.header.forEach(header => {
      if (header.id === i) {
        if (header.isExpanded === true) {
          header.isExpanded = false;
        } else if (header.isExpanded === false) {
          header.isExpanded = true;
        }
      } else if (header.id !== i) {
        header.isExpanded = false;
      }
    });
  }

  openSubHeader(i) {
    console.log('openSubHeader');
    this.subHeader.map(items => {
      if (items.uid === i) {
        this.subHeaderData = items.data;
      }
    });
    if (this.subHeaderData) {
      this.subHeaderData.forEach(data => {
        const newData = this.studentService.data.filter(d => d.uid === data.uid);
        newData.map((item: Data) => {
          data.data = item.data;
          data.type = item.type;
        });
      });
    }
    this.subHeader.forEach(subHeader => {
      if (subHeader.uid === i) {
        if (subHeader.isExpanded === true) {
          subHeader.isExpanded = false;
        } else if (subHeader.isExpanded === false) {
          subHeader.isExpanded = true;
        }
      } else if (subHeader.uid !== i) {
        subHeader.isExpanded = false;
      }
    });
  }

  editHeader(i) {
    console.log('editHeader');
    this.header.forEach(header => {
      if (header.id === i) {
        if (header.isEdit === true) {
          header.isEdit = false;
        } else if (header.isEdit === false) {
          header.isEdit = true;
        }
      } else if (header.id !== i) {
        header.isEdit = false;
      }
    });
  }

  editSubHeader(i) {
    console.log('editSubHeader');
    this.subHeader.forEach(subHeader => {
      if (subHeader.uid === i) {
        if (subHeader.isEdit === true) {
          subHeader.isEdit = false;
        } else if (subHeader.isEdit === false) {
          subHeader.isEdit = true;
        }
      } else if (subHeader.uid !== i) {
        subHeader.isEdit = false;
      }
    });
  }

  updateHeaderName(i) {
    console.log('updateHeaderName');
    this.analyticService.logEvent('edit-header', false);
    this.header.forEach(header => {
      if (header.uid === i) {
        this.studentService.editHeader(this.reportUid, header.name, header.uid);
        header.isEdit = false;
      }
    });
  }

  updateSubHeaderName(i) {
    console.log('updateSubHeaderName');
    this.analyticService.logEvent('edit-subHeader', false);
    this.subHeader.forEach(element => {
      if (element.uid === i) {
        this.studentService.editSubHeader(
          this.reportUid,
          element.name,
          element.uid
        );
        element.isEdit = false;
      }
    });
  }

  cancelUpdateHeaderName(i) {
    console.log('cancelUpdateHeaderName');
    this.header.forEach(header => {
      if (header.uid === i) {
        header.isEdit = false;
      }
    });
  }

  cancelUpdateSubHeaderName(i) {
    console.log('cancelUpdateSubHeaderName');
    this.subHeader.forEach(subHeader => {
      if (subHeader.uid === i) {
        subHeader.isEdit = false;
      }
    });
  }

  deleteHeader(headerId) {
    console.log('deleteHeader');
    this.analyticService.logEvent('delete-header', false);
    this.header.forEach(header => {
      if (header.id === headerId) {
        this.studentService.deleteHeader(this.reportUid, this.header, header.uid);
      }
    });
  }

  deleteSubHeader(header: Header, subHeader: Header) {
    console.log('deleteSubHeader');
    this.analyticService.logEvent('delete-subHeader', false);
    this.studentService.deleteSubHeader(
      this.reportUid,
      header.uid,
      header.data,
      subHeader.uid,
      subHeader.data
    );
  }

  deleteHeaderData(headerId, dataUid) {
    console.log('deleteHeaderData');
    this.analyticService.logEvent('delete-data-header', false);
    this.header.forEach((element: Header) => {
      if (element.id === headerId) {
        this.studentService.deleteHeaderData(
          this.reportUid,
          element.uid,
          dataUid,
          element.data
        );
      }
    });
  }

  deleteSubHeaderData(subUid, dataUid) {
    console.log('deleteSubHeaderData');
    this.analyticService.logEvent('delete-data-subHeader', false);
    this.subHeader.forEach((element: Header) => {
      if (element.uid === subUid) {
        this.studentService.deleteSubHeaderData(
          this.reportUid,
          element.uid,
          dataUid,
          element.data
        );
      }
    });
  }

  openTextEditor(headerUid, subHeaderUid = '', data: Data = {}) {
    console.log('openTextEditor');
    this.header.forEach(async (eHeader: Header) => {
      if (eHeader.uid === headerUid) {
        if (subHeaderUid !== '') {
          this.subHeader.forEach(async (eSubHeader: Header) => {
            if (eSubHeader.uid === subHeaderUid) {
              const modal = await this.modalController.create({
                component: TextEditorPage,
                componentProps: {
                  docId: this.reportUid,
                  header: eHeader,
                  subHeader: eSubHeader,
                  initData: data
                }
              });
              return await modal.present();
            }
          });
        } else {
          const modal = await this.modalController.create({
            component: TextEditorPage,
            componentProps: {
              docId: this.reportUid,
              header: eHeader,
              subHeader: undefined,
              initData: data
            }
          });
          return await modal.present();
        }
      }
    });
  }

  async addImage(event: any, headerUid, subHeaderUid = '', data: Data = {}) {
    console.log('addImage');
    this.commonService.showToast('Uploading...');
    this.commonService.loading(false, 'writing-addImage');
    this.uploadImage(event.target.files[0], headerUid, subHeaderUid, data);
  }

  async uploadImage(
    fileUrl,
    headerUid: string,
    subHeaderUid: string = '',
    data: Data = {}
  ) {
    console.log('uploadImage');
    this.analyticService.logEvent('add-image', false);
    this.header.forEach(async eHeader => {
      if (eHeader.uid === headerUid) {
        if (subHeaderUid !== '') {
          if (eHeader.data === undefined) {
            eHeader.data = [];
          }
          this.subHeader.forEach(async eSubHeader => {
            if (eSubHeader.uid === subHeaderUid) {
              const dataUid = await this.studentService.addSubHeaderData(
                this.reportUid,
                'init',
                'image',
                eSubHeader
              );
              this.doneSubHeader = false;
              this.studentService.storeImage(this.reportUid, fileUrl, dataUid);
            }
          });
        } else {
          if (eHeader.data === undefined) {
            eHeader.data = [];
          }
          const dataUid = await this.studentService.addHeaderData(
            this.reportUid,
            'init',
            'image',
            eHeader
          );
          this.doneHeader = false;
          this.studentService.storeImage(this.reportUid, fileUrl, dataUid);
        }
      }
    });
  }

  async updateImage(headerUid, subHeaderUid = '', data: Data = {}) {
    console.log('updateImage');
    const modal = await this.modalController.create({
      component: ImageViewerPage,
      componentProps: {
        docId: this.reportUid,
        header: headerUid,
        subHeader: subHeaderUid,
        initData: data
      }
    });
    return await modal.present();
  }

  async preview() {
    console.log('preview');
    if (this.report) {
      this.analyticService.logEvent('preview-report', false);
      const modal = await this.modalController.create({
        component: ReportViewerPage,
        // cssClass: 'wideModal',
        componentProps: {
          report: this.studentService.selectedReport,
          header: this.studentService.header,
          subHeader: this.studentService.subHeader,
          data: this.studentService.data,
          from: 'writing',
          user: this.user
        }
      });
      return await modal.present();
    } else {
      this.commonService.showToast('No report to view');
    }
  }

  closeSlider(item: IonItemSliding) {
    item.close();
  }

  reorderHeader(event) {
    console.log('reorderHeader');
    this.analyticService.logEvent('reorder-header', false);
    if (event.target.id === 'idHeader') {
      const newHeader = this.header as Header[];
      const itemToMove = newHeader.splice(event.detail.from, 1)[0];
      newHeader.splice(event.detail.to, 0, itemToMove);
      let index = 0;
      // tslint:disable-next-line: no-shadowed-variable
      newHeader.forEach(element => {
        index += 1;
        element.id = index;
      });
      this.studentService.updateOrderHeader(this.reportUid, newHeader);
    }
    event.detail.complete();
  }

  reorderHeaderData(event, headerUid: string) {
    console.log('reorderHeaderData');
    this.analyticService.logEvent('reorder-data-header', false);
    if (event.target.id === 'idHeaderData') {
      const newHeaderData = this.headerData as HeaderData[];
      const itemToMove = newHeaderData.splice(event.detail.from, 1)[0];
      newHeaderData.splice(event.detail.to, 0, itemToMove);
      const newArray = [] as HeaderData[];
      let index = 0;
      // tslint:disable-next-line: no-shadowed-variable
      newHeaderData.forEach(element => {
        index += 1;
        newArray.push({
          id: index,
          sub: element.sub,
          uid: element.uid
        });
      });
      this.studentService.updateOrderHeaderData(
        this.reportUid,
        newArray,
        headerUid
      );
    }
    event.detail.complete();
  }

  reorderSubHeaderData(event, subHeaderUid: string) {
    console.log('reorderSubHeaderData');
    this.analyticService.logEvent('reorder-data-subHeader', false);
    if (event.target.id === 'idSubHeaderData') {
      const newSubHeaderData = this.subHeaderData as HeaderData[];
      const itemToMove = newSubHeaderData.splice(event.detail.from, 1)[0];
      newSubHeaderData.splice(event.detail.to, 0, itemToMove);
      const newArray = [] as HeaderData[];
      let index = 0;
      // tslint:disable-next-line: no-shadowed-variable
      newSubHeaderData.forEach(element => {
        index += 1;
        newArray.push({
          id: index,
          sub: element.sub,
          uid: element.uid
        });
      });
      this.studentService.updateOrderSubHeaderData(
        this.reportUid,
        newArray,
        subHeaderUid
      );
    }
    event.detail.complete();
  }

  async logScrolling($event) {
    if ($event.target.localName !== 'ion-content') {
      return;
    }

    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight =
      scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    const triggerDepth = (scrollHeight / 100) * targetPercent;
    const height = this.title.clientHeight;

    if ($event.detail.scrollTop > Math.max(0, this.lastX)) {
      this.renderer.setStyle(this.title, 'margin-top', `-${height}px`);
      this.renderer.setStyle(this.title, 'transition', 'margin-top 400ms');
    } else {
      this.renderer.setStyle(this.title, 'margin-top', '0');
      this.renderer.setStyle(this.title, 'transition', 'margin-top 400ms');
    }
    this.lastX = $event.detail.scrollTop;

    if (currentScrollDepth > triggerDepth) {
      this.renderer.setStyle(this.title, 'margin-top', `-${height}px`);
      this.renderer.setStyle(this.title, 'transition', 'margin-top 50ms');
    }
  }

  scrollStart(title) {
    this.title = title.el;
  }
}
