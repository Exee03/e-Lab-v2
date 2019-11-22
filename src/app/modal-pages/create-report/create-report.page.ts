import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';
import { StudentService } from 'src/app/services/student/student.service';
import { Course } from 'src/app/models/course';
import { Group } from 'src/app/models/group';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.page.html',
  styleUrls: ['./create-report.page.scss'],
})
export class CreateReportPage implements OnInit {

  title = '';
  course: Course;
  group: Group;
  userUid: string;
  from = '';

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
    private studentService: StudentService,
    private navParams: NavParams,
    private router: Router
    ) {
    }

  ngOnInit() {
    this.course = this.navParams.get('course');
    this.group = this.navParams.get('group');
    this.userUid = this.navParams.get('userUid');
    this.title = this.navParams.get('title');
    this.from = this.navParams.get('from');
  }

  createReport() {
    this.commonService.showToast('Creating new report...');
    this.title = (this.title === '') ? 'Untitled - ' + this.commonService.getTime() : this.commonService.capitalize(this.title);
    // tslint:disable-next-line: max-line-length
    this.studentService.addReport(this.title, this.course.uid, this.group.uid, this.userUid).finally(() => this.router.navigate([this.from]));
    this.closeCreateReport();
  }

  async closeCreateReport() {
    await this.modalController.dismiss();
  }

}
