import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Course } from 'src/app/models/course';
import { CommonService } from 'src/app/services/common/common.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Group } from 'src/app/models/group';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { LecturerService } from 'src/app/services/lecturer/lecturer.service';
import { FileViewPage } from '../file-view/file-view.page';
import { CreateReportPage } from '../create-report/create-report.page';

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
    private lecturerService: LecturerService
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
    if (this.from === 'categories') {
      this.getFile(selectCourse);
      await this.modalController.dismiss();
    } else {
      this.courses.forEach(course => {
        if (course.uid === selectCourse.uid) {
          if (course.showGroup === false) {
            course.showGroup = true;
          } else {
            course.showGroup = false;
          }
        }
      });
    }
  }

  async selectGroup(course: Course, group: Group) {
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
      const category = this.lecturerService.uploadCategory;
      if (category !== 'Reference') {
        if (this.lecturerService.files.length !== 0) {
          const selectedFile = this.lecturerService.files.find(file => file.course === course.uid);
          if (selectedFile === undefined) {
            this.commonService.showToast(`No ${category} file is selected by lecturer !!!`);
          } else {
            this.viewFile(selectedFile);
          }
        } else {
          this.commonService.showToast(`No ${category} file is selected by lecturer !!!`);
        }
      } else {
        this.selectGroupDetail(course);
        this.router.navigate(['list-file']);
      }
    }
  }

  private selectGroupDetail(course: Course) {
    this.lecturerService.selectedGroupDetail = this.commonService.groupDetails.value.find(gd => gd.courseUid === course.uid);
  }

  async viewFile(selectedFile) {
    const modal = await this.modalController.create({
      component: FileViewPage,
      cssClass: 'wideModal',
      componentProps: {
        pages: selectedFile.page
      }
    });
    // this.analyticsService.logEvent('labContent-done');
    return await modal.present();
  }

}
