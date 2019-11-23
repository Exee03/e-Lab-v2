import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { Report } from 'src/app/models/report';
import { ModalController, IonItemSliding } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { StudentService } from 'src/app/services/student/student.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { SelectCoursePage } from 'src/app/modal-pages/select-course/select-course.page';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { CreateReportPage } from 'src/app/modal-pages/create-report/create-report.page';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  lastX: any;
  user: User;
  role = '';
  hasVerified = true;
  report: Report[] = [];
  isEmpty = true;
  unsubscribeListReport$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private renderer: Renderer2,
    private storage: Storage,
    private router: Router,
    private authService: AuthenticationService,
    private studentService: StudentService,
    private commonService: CommonService
    ) {
      this.hasVerified = this.authService.isEmailVerified.value;
      this.authService.user$.pipe(first()).subscribe(user => {
        this.role = authService.getRole(user);
        this.user = user;
      });
      this.isEmpty = (studentService.reports.value.length === 0) ? true : false;
      this.studentService.reports.pipe(takeUntil(this.unsubscribeListReport$)).subscribe(reports => {
        this.report = [];
        reports.forEach(report => {
          const course = this.commonService.groupDetails.value.find(gd => gd.courseUid === report.course);
          this.report.push({
            uid: report.uid,
            courseCode: course.courseCode,
            // course: course.uid,
            lastEdit: report.lastEdit,
            title: report.title,
            submit: report.submit
          });
        });
      });
    }

  ngOnInit() {
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
    const scrollHeight =
      scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    const triggerDepth = (scrollHeight / 100) * targetPercent;
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

  closeSlider(item: IonItemSliding) {
    item.close();
  }

  openReport(report: Report) {
    // this.storage.set('course-token', report.course);
    this.storage.set('report-token', report.uid);
    this.router.navigate(['writing']);
  }

  deleteReport(reportUid: string) {
    this.studentService.deleteReport(reportUid);
  }

  async createReport() {
    // this.analyticsService.logEvent('createReport-done', { method: 'create' });
    const modal = await this.modalController.create({
      component: SelectCoursePage,
      componentProps: {
        user: this.user,
        from: 'writing'
      }
    });
    return await modal.present();
  }

  async editReport(reportUid: string) {
    const report = this.studentService.reports.value.find(r => r.uid === reportUid);
    const course = this.commonService.courseWithGroup.value.find(c => c.uid === report.course);
    const group = course.groups.find(g => g.uid === report.group);
    const modal = await this.modalController.create({
      component: CreateReportPage,
      componentProps: {
        course,
        group,
        userUid: this.user.uid,
        title: report.title,
        from: 'Edit'
      }
    });
    return await modal.present();
  }

}
