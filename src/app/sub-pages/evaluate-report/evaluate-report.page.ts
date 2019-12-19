import { Component, OnInit } from '@angular/core';
import { Header, Data, Report, HeaderData } from 'src/app/models/report';
import { User } from 'src/app/models/user';
import { GroupDetail } from 'src/app/models/group';
import { LecturerService } from 'src/app/services/lecturer/lecturer.service';
import { MenuController } from '@ionic/angular';
import { Items } from 'src/app/models/files';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-evaluate-report',
  templateUrl: './evaluate-report.page.html',
  styleUrls: ['./evaluate-report.page.scss']
})
export class EvaluateReportPage implements OnInit {
  report: Report;
  header: Header[];
  subHeader: Header[];
  data: Data[];
  from: string;
  user: User;
  document = [];
  groupDetail: GroupDetail;
  items: Items[] = [];
  unsubscribeEvaluate$ = new Subject<void>();

  constructor(
    private menuCtrl: MenuController,
    private lecturerService: LecturerService,
    private commonService: CommonService,
    private analyticService: AnalyticsService
  ) {
    this.menuCtrl.enable(true, 'evaluation');
    this.menuCtrl.enable(false, 'mainMenu');
    this.report = this.lecturerService.selectedReportData.report;
    this.header = this.lecturerService.selectedReportData.headers;
    this.subHeader = this.lecturerService.selectedReportData.subHeaders;
    this.data = this.lecturerService.selectedReportData.data;
    this.groupDetail = this.lecturerService.selectedGroupDetail.value;
    this.user = this.lecturerService.studentData;
  }

  ngOnInit() {
    this.fetchDocument();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeEvaluate$.next();
    this.unsubscribeEvaluate$.complete();
    this.menuCtrl.enable(false, 'evaluation');
    this.menuCtrl.enable(true, 'mainMenu');
    // this.router.navigate(['student-report']);
  }

  addHeader(data: string) {
    const h1 = document.createElement('h1');
    const text = document.createTextNode(data);
    h1.appendChild(text);
    h1.className = 'header';
    // console.log(h1);
    if (document.getElementById('headers') !== null) {
      document.getElementById('headers').appendChild(h1);
    }
  }

  addSubHeader(data: string) {
    const br = document.createElement('br');
    const h3 = document.createElement('h3');
    const text = document.createTextNode(data);
    const element = document.getElementById('headers');
    h3.appendChild(br);
    h3.appendChild(text);
    element.appendChild(h3);
  }

  addData(data: string, type: string, level: number) {
    const br = document.createElement('br');
    const img = document.createElement('img');
    const element = document.getElementById('headers');
    element.className = 'avoid';
    element.appendChild(br);
    if (type === 'image') {
      const center = document.createElement('p');
      center.style.textAlign = 'center';
      img.src = data;
      img.width = 300;
      center.append(img);
      element.appendChild(center);
    } else if (type === 'text') {
      if (level === 3) {
        data = '<dd>' + data + '</dd>';
      }
      element.insertAdjacentHTML('beforeend', data);
      element.className = 'spacing';
    }
  }

  fetchDocument() {
    let indexHeader = 1.0;
    let indexSubHeader = 0.1;
    this.header.forEach((head: Header) => {
      this.addHeader(indexHeader + '. ' + head.name.toUpperCase());
      this.document.push({ level: 1, index: indexHeader, name: head.name });
      if (head.data !== undefined) {
        head.data.forEach(headData => {
          if (headData.sub) {
            this.subHeader.forEach((sub: Header) => {
              if (headData.uid === sub.uid) {
                const combineIndex = indexHeader + indexSubHeader;
                this.addSubHeader(combineIndex + '. ' + sub.name);
                this.document.push({
                  level: 2,
                  index: combineIndex,
                  name: sub.name,
                  type: 'sub'
                });
                indexSubHeader += 0.1;
                if (sub.data !== undefined) {
                  sub.data.forEach((subData: HeaderData) => {
                    this.data.forEach((dataItem: Data) => {
                      if (dataItem.uid === subData.uid) {
                        this.addData(dataItem.data, dataItem.type, 3);
                        this.document.push({
                          level: 3,
                          name: dataItem.data,
                          type: dataItem.type
                        });
                      }
                    });
                  });
                }
              }
            });
          } else {
            this.data.forEach((dataItem: Data) => {
              if (dataItem.uid === headData.uid) {
                this.addData(dataItem.data, dataItem.type, 2);
                this.document.push({
                  level: 2,
                  name: dataItem.data,
                  type: dataItem.type
                });
              }
            });
          }
        });
      }
      indexHeader += 1;
      indexSubHeader = 0.1;
    });
    return this.document;
  }

  doneEvaluate() {
    this.analyticService.logEvent('submit-evaluation', false);
    let isComplete = true;
    this.items = this.lecturerService.items.value;
    this.items.forEach(item => {
      if (item.mark === 0) {
        isComplete = false;
      }
    });
    if (!isComplete) {
      this.commonService.showAlert(
        'Oppsss...',
        '',
        'The Evaluation Form still have blank mark. Please complete the form before submit it.'
      );
    } else {
      this.lecturerService.submitEvaluation(this.items);
    }
  }
}
