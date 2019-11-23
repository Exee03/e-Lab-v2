import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReportViewerPage } from 'src/app/modal-pages/report-viewer/report-viewer.page';
import { Report } from 'src/app/models/report';
import { Evaluate } from 'src/app/models/files';
import { Chart } from 'chart.js';
import { CommonService } from 'src/app/services/common/common.service';
import { StudentService } from 'src/app/services/student/student.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { first } from 'rxjs/operators';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-my-report-detail',
  templateUrl: './my-report-detail.page.html',
  styleUrls: ['./my-report-detail.page.scss'],
})
export class MyReportDetailPage implements OnInit {
  user: User;
  report: Report;
  evaluation: Evaluate;
  labels = [];
  data = [];
  backgroundColor = [];

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private studentService: StudentService
  ) {
    this.report = this.studentService.selectedReport;
    this.evaluation = this.studentService.evaluation;
    this.authService.user$.pipe(first()).subscribe(user => this.user = user);
  }

  ngOnInit() {
    this.evaluation.items.forEach(item => {
      this.labels.push(item.id);
      this.data.push(item.mark);
      this.backgroundColor.push(this.commonService.getRandomColor());
    });
    this.createChart();
  }

  createChart() {
    const canvas: any = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');
    ctx.height = 200;
    ctx.width = 200;
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.data,
            backgroundColor: this.backgroundColor,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  async openReport() {
    // this.analyticsService.logEvent('previewWriteReport-start', {method: this.report.uid});
    const modal = await this.modalController.create({
      component: ReportViewerPage,
      componentProps: {
        report: this.report,
        header: this.studentService.header,
        subHeader: this.studentService.subHeader,
        data: this.studentService.data,
        from: 'my-report',
        user: this.user
      }
    });
    return await modal.present();
  }

}
