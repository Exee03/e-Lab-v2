import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams, ActionSheetController } from '@ionic/angular';
import { GroupDetail } from 'src/app/models/group';
import { User } from 'src/app/models/user';
import { Report, Header, Data, HeaderData } from 'src/app/models/report';
import { StudentService } from 'src/app/services/student/student.service';
import { CommonService } from 'src/app/services/common/common.service';
import * as html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.page.html',
  styleUrls: ['./report-viewer.page.scss'],
})
export class ReportViewerPage implements OnInit {
  @Input() report: Report;
  @Input() header: Header[];
  @Input() subHeader: Header[];
  @Input() data: Data[];
  @Input() from: string;
  @Input() user: User;
  document = [];
  groupDetail: GroupDetail;

  constructor(
    private modalController: ModalController,
    public actionSheetController: ActionSheetController,
    private navParams: NavParams,
    private studentService: StudentService,
    private commonService: CommonService
  ) {
    this.report = this.navParams.get('report');
    this.header = this.navParams.get('header');
    this.subHeader = this.navParams.get('subHeader');
    this.data = this.navParams.get('data');
    this.from = this.navParams.get('from');
    this.user = this.navParams.get('user');
    // tslint:disable-next-line: max-line-length
    this.groupDetail = (this.from === 'writing' || this.from === 'my-report') ? this.studentService.selectedGroupDetail : this.commonService.selectedGroupDetail;
  }

  ngOnInit() {
    this.fetchDocument();
  }

  addHeader(data: string) {
    const h1 = document.createElement('h1');
    const text = document.createTextNode(data);
    h1.appendChild(text);
    h1.className = 'header';
    document.getElementById('headers').appendChild(h1);
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
    // this.analyticsService.logEvent('previewWriteReport-done', {method: this.report.uid});
    return this.document;
  }

  downloadPdf() {
    if (!this.commonService.isNative()) {
      const element = document.getElementById('report');
      html2pdf()
        .from(element)
        .set({
          margin: 1,
          filename: this.report.title,
          html2canvas: {
            logging: true,
            removeContainer: true,
            scale: 2
          },
          jsPDF: {
            orientation: 'portrait',
            unit: 'in',
            format: 'letter'
          },
          image: { type: 'png', quality: 0.98 },
          pagebreak: {
            before: ['.before', '.header'],
            // after: '.frontPage',
            avoid: ['.avoid']
          }
        })
        .save();
    } else {
      // tslint:disable-next-line: max-line-length
      this.commonService.showAlert('Oppsss...', 'Sorry. Download PDF still not yet available in this system', 'This features only available for the WebApp version.');
    }
  }

  async presentActionSheet() {
    // this.analyticsService.logEvent('submitReport-start');
    const actionSheet = await this.actionSheetController.create({
      header: 'Report',
      buttons: [{
        text: 'Submit',
        icon: 'cloud-upload',
        handler: () => {
          this.commonService.showToast('Your report is being submitted...');
          this.studentService.submitReport(this.report.uid);
          // tslint:disable-next-line: max-line-length
          this.commonService.showAlert('Successful', '', 'Your report is successfully upload. Now you can see your report status in the My Report.');
          this.closeTextEditor();
        }
      }, {
        text: 'Download PDF',
        icon: 'cloud-download',
        handler: () => {
          this.commonService.showToast('Your report is downloading...');
          this.downloadPdf();
          this.closeTextEditor();
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async closeTextEditor() {
    await this.modalController.dismiss();
  }

}
