import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Course } from 'src/app/models/course';
import { CommonService } from 'src/app/services/common/common.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Group } from 'src/app/models/group';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { LecturerService } from 'src/app/services/lecturer/lecturer.service';
import { CreateReportPage } from '../create-report/create-report.page';
import { FileViewerPage } from '../file-viewer/file-viewer.page';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.page.html',
  styleUrls: ['./select-course.page.scss'],
})
export class SelectCoursePage implements OnInit {
  courses: Course[] = [];
  user: User;
  username = '';
  userUid = '';
  textFilter = '';
  from = '';

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private router: Router,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private lecturerService: LecturerService,
    private analyticService: AnalyticsService
    ) {
      this.user = this.navParams.get('user');
      this.from = this.navParams.get('from');
      this.username = this.user.displayName;
      this.userUid = this.user.uid;
      this.courses = this.commonService.courseWithGroup.value;
    }

  ngOnInit() {
  }

  filterCourse(event) {
    const text: string = event.target.value;
    this.textFilter = text;
  }

  async selectCourse(selectCourse: Course) {
    if (this.from === 'select-file') {
      this.analyticService.logEvent('view-file-student', false);
      this.getFile(selectCourse);
      await this.modalController.dismiss();
    } else if (this.from === 'student-report') {
      this.analyticService.logEvent('view-student-report', false);
      this.lecturerService.selectedGroupDetail.next(this.commonService.groupDetails.value.find(gd => gd.courseUid === selectCourse.uid));
      await this.modalController.dismiss();
    } else {
      this.courses.forEach(course => {
        if (course.uid === selectCourse.uid) {
          if (course.showGroup === false) {
            course.showGroup = true;
          } else {
            course.showGroup = false;
          }
        } else {
          course.showGroup = false;
        }
      });
    }
  }

  async selectGroup(course: Course, group: Group) {
    course.showGroup = false;
    await this.modalController.dismiss();
    if (this.from === 'writing') {
      const modal = await this.modalController.create({
        component: CreateReportPage,
        componentProps: {
          course,
          group,
          userUid: this.userUid,
          title: '',
          from: 'Create',
        }
      });
      return await modal.present();
    }
  }

  private getFile(course: Course) {
    if (this.authService.isAdmin(this.user) || this.authService.isLecturer(this.user)) {
      this.selectGroupDetail(course);
      this.router.navigate(['list-file']);
    } else {
      const category = this.commonService.uploadCategory;
      if (category !== 'Reference') {
        if (this.commonService.files.value.length !== 0) {
          const selectedFile = this.commonService.files.value.find(file => file.course === course.uid);
          if (selectedFile === undefined) {
            this.commonService.showToast(`No ${category} file is selected by lecturer.`);
          } else {
            this.viewFile(selectedFile);
          }
        } else {
          this.commonService.showToast(`No ${category} file is selected by lecturer.`);
        }
      } else {
        this.selectGroupDetail(course);
        this.router.navigate(['list-file']).finally(() => this.analyticService.logEvent('view-file-student', true, 'Reference'));
      }
    }
  }

  private selectGroupDetail(course: Course) {
    this.commonService.selectedGroupDetail = this.commonService.groupDetails.value.find(gd => gd.courseUid === course.uid);
  }

  async viewFile(selectedFile) {
    const modal = await this.modalController.create({
      component: FileViewerPage,
      cssClass: 'wideModal',
      componentProps: {
        pages: selectedFile.page
      }
    });
    // this.analyticsService.logEvent('labContent-done');
    return await modal.present().finally(() => this.analyticService.logEvent('view-file-student', true));
  }

}
