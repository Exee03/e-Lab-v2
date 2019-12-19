import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { LecturerService } from 'src/app/services/lecturer/lecturer.service';
import { Report } from 'src/app/models/report';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { SelectCoursePage } from 'src/app/modal-pages/select-course/select-course.page';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.page.html',
  styleUrls: ['./student.page.scss'],
})
export class StudentPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  lastX: any;
  role = '';
  hasVerified = true;
  isEmpty = true;
  reports: Report[];
  unsubscribeListReport$ = new Subject<void>();
  user = new BehaviorSubject<User>(null);

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private modalController: ModalController,
    private lecturerService: LecturerService,
    private authService: AuthenticationService,
    private analyticService: AnalyticsService
    ) {
      this.hasVerified = this.authService.isEmailVerified.value;
      this.lecturerService.reports.pipe(takeUntil(this.unsubscribeListReport$)).subscribe(report => {
        if (report) { this.getReport(); }
      });
      this.authService.user$.pipe(takeUntil(this.unsubscribeListReport$)).subscribe(user => {
        this.user.next(user);
      });
    }

  private getReport() {
    this.lecturerService.selectedGroupDetail.pipe(takeUntil(this.unsubscribeListReport$)).subscribe(groupDetails => {
      if (groupDetails !== null) {
        this.lecturerService.getReportWithUserData().then(() => {
          this.reports = this.lecturerService.reportsWithUserData;
          this.isEmpty = (this.reports.length !== 0) ? false : true;
          this.analyticService.logEvent('view-student-report', true);
        });
      }
    });
  }

  ngOnInit() {
    this.user.pipe(takeUntil(this.unsubscribeListReport$)).subscribe(user => {
      // tslint:disable-next-line: no-unused-expression
      (user) ? this.selectCourse() : null;
    });
  }

  async selectCourse() {
    const modal = await this.modalController.create({
      component: SelectCoursePage,
      componentProps: {
        user: this.user.value,
        from: 'student-report'
      }
    });
    return await modal.present();
  }

  openReport(report: Report) {
    this.analyticService.logEvent('open-student-report', false);
    this.lecturerService.getStudentData(report.uid);
    this.router.navigate(['menu/evaluate-report']).finally(() => this.analyticService.logEvent('open-student-report', true));
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeListReport$.next();
    this.unsubscribeListReport$.complete();
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

}
