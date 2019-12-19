import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { StudentService } from 'src/app/services/student/student.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Report } from 'src/app/models/report';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-my-report',
  templateUrl: './my-report.page.html',
  styleUrls: ['./my-report.page.scss'],
})
export class MyReportPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  lastX: any;
  user: User;
  role = '';
  hasVerified = true;
  reports = [];
  isEmpty = true;


  constructor(
    private renderer: Renderer2,
    private authService: AuthenticationService,
    private studentService: StudentService,
    private commonService: CommonService,
    private analyticService: AnalyticsService
    ) {
      this.hasVerified = this.authService.isEmailVerified.value;
      this.studentService.reports.pipe(takeUntil(this.studentService.unsubscribeReport$)).subscribe(reports => {
        if (reports.length !== 0) {
          this.reports = reports;
          this.isEmpty = false;
        } else {
           this.isEmpty = true;
        }
      });
    }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.studentService.unsubscribeReport$.next();
    this.studentService.unsubscribeReport$.complete();
  }

  async logScrolling($event) {
    if ($event.target.localName !== 'ion-content') {
      return;
    }

    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    const triggerDepth = ((scrollHeight / 100) * targetPercent);
    const headerVerify = document.getElementById('headerVerify');
    let height = this.header.clientHeight;
    if (!this.hasVerified) {
      height = this.header.clientHeight - headerVerify.clientHeight;
    }
    if ($event.detail.scrollTop > Math.max(0, this.lastX)) {
      this.renderer.setStyle(this.header, 'margin-top', `-${height}px`);
      this.renderer.setStyle(this.header, 'transition', 'margin-top 400ms');
      if (!this.hasVerified) {
        headerVerify.classList.replace('hasVerified', 'overlay');
      }
    } else {
      this.renderer.setStyle(this.header, 'z-index', '-20');
      this.renderer.setStyle(this.header, 'margin-top', '0');
      this.renderer.setStyle(this.header, 'transition', 'margin-top 400ms');
      if (!this.hasVerified) {
        headerVerify.classList.replace('overlay', 'hasVerified');
      }
    }
    this.lastX = $event.detail.scrollTop;

    if (currentScrollDepth > triggerDepth) {
      this.renderer.setStyle(this.header, 'margin-top', `-${height}px`);
      this.renderer.setStyle(this.header, 'transition', 'margin-top 50ms');
      if (!this.hasVerified) {
        headerVerify.classList.replace('hasVerified', 'overlay');
      }
    }
  }

  scrollStart(header) {
    this.header = header.el;
  }

  async openReport(report: Report) {
    if (report.evaluate !== undefined) {
      this.analyticService.logEvent('view-mark', false);
      this.commonService.showToast('Getting report...');
      this.studentService.getEvaluation(report.uid);
    } else {
      this.commonService.showAlert(
        'Oppsss...',
        '',
        'This report still not evaluate. Please try again later.'
        );
    }
  }

}
