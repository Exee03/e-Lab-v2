import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';
import { StudentService } from 'src/app/services/student/student.service';
import { Course } from 'src/app/models/course';
import { Group } from 'src/app/models/group';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { Items } from 'src/app/models/files';
import { User } from 'src/app/models/user';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  items: Items[] = [{
    id: 1,
    text: ''
  }];
  textFilter = '';
  users: User[] = [];
  unsubscribeUsers$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private router: Router,
    private commonService: CommonService,
    private studentService: StudentService,
    private analyticService: AnalyticsService
    ) {
      this.studentService.inGroup.pipe(takeUntil(this.unsubscribeUsers$)).subscribe(inGroup => {
        if (inGroup === true) {
          this.studentService.groupMembers.pipe(takeUntil(this.unsubscribeUsers$)).subscribe(users => {
            this.users = users;
          });
        }
      });
    }

  ngOnInit() {
    this.course = this.navParams.get('course');
    this.group = this.navParams.get('group');
    this.userUid = this.navParams.get('userUid');
    this.title = this.navParams.get('title');
    this.from = this.navParams.get('from');
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeUsers$.next();
    this.unsubscribeUsers$.complete();
  }

  filterCourse(event) {
    const text: string = event.target.value;
    this.textFilter = text;
  }

  addItem() {
    this.items.push({
      id: this.items.length + 1,
      text: ''
    });
  }

  removeItem(index: number) {
    const oldArray = this.items.splice(index);
    const remains = oldArray.slice(1, oldArray.length);
    this.items = this.items.concat(remains);
    // tslint:disable-next-line: no-shadowed-variable
    for (let index = 0; index < this.items.length; index++) {
      const element = this.items[index];
      element.id = index + 1;
    }
  }

  createReport() {
    this.analyticService.logEvent('create-report', false);
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
