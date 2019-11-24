import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';
import { AdminService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.page.html',
  styleUrls: ['./course.page.scss'],
})
export class CoursePage implements OnInit {

  code = '';
  name = '';
  from = '';

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private commonService: CommonService,
    private adminService: AdminService
    ) {
      this.code = this.navParams.get('code');
      this.name = this.navParams.get('name');
      this.from = this.navParams.get('from');
    }

  ngOnInit() {
  }

  submit() {
    if (this.from === 'Create') {
      this.commonService.showToast('Creating Course...').then(_ => {
        return this.adminService.addCourse(this.code.toUpperCase(), this.commonService.capitalize(this.name));
      }).then(_ => {
        this.commonService.showToast('Successfully create your Course');
        this.closeCourse();
      });
    } else {
      this.commonService.showToast('Updating...').then(_ => {
        return this.adminService.editCourse(this.code.toUpperCase(), this.commonService.capitalize(this.name));
      }).then(_ => {
        this.commonService.showToast('Successfully update your Course');
        this.closeCourse();
      });
    }
  }

  async closeCourse() {
    await this.modalController.dismiss();
  }

}
