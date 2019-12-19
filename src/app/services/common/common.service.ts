import { Injectable } from '@angular/core';
import { ToastController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from '../database/database.service';
import { takeUntil } from 'rxjs/operators';
import { GroupDetail, Group } from 'src/app/models/group';
import { Course } from 'src/app/models/course';
import { Files } from 'src/app/models/files';
import { Faculty } from 'src/app/models/faculty';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  faculties = new BehaviorSubject<Faculty[]>([]);
  studentReport = new BehaviorSubject(0);
  lecturerReport = new BehaviorSubject(0);
  groupDetails = new BehaviorSubject<GroupDetail[]>([]);
  courseWithGroup = new BehaviorSubject<Course[]>([]);
  rubrics = new BehaviorSubject<Files[]>([]);
  manuals = new BehaviorSubject<Files[]>([]);
  schedules = new BehaviorSubject<Files[]>([]);
  references = new BehaviorSubject<Files[]>([]);
  uploadCategory: string;
  selectedGroupDetail: GroupDetail;
  files = new BehaviorSubject<Files[]>([]);

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private platform: Platform,
    private databaseService: DatabaseService,
    private analyticService: AnalyticsService
  ) {}

  isNative() {
    return this.platform.is('capacitor');
  }

  getPlatform() {
    return this.platform.platforms();
  }

  getTime() {
    const dateTime = new Date();
    // tslint:disable-next-line: max-line-length
    return dateTime.toLocaleString();
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  async loading(isDone: boolean, from: string) {
    if (isDone) {
      console.log('Stop loading:', from);
      this.loadingController.dismiss();
    } else {
      console.log('Start loading:', from);
      const loading = await this.loadingController.create({
        translucent: true
      });
      await loading.present();
    }
  }

  async showAlert(header, subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header,
      subHeader,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showToast(text: string) {
    this.toastController.getTop();
    const toast = await this.toastController.create({
      message: text,
      duration: 2000
    });
    return toast.present();
  }

  async showAlertError(header, subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header,
      subHeader,
      message,
      buttons: ['OK']
    });
    // this.loading(true, message);
    await alert.present();
  }

  capitalize(str: string) {
    // tslint:disable-next-line: only-arrow-functions
    return str.replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
  }

  getAllFaculty() {
    return this.databaseService.getAllFaculty().pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(faculties => {
      (faculties) ? this.faculties.next(faculties) : this.faculties.next([]);
    });
  }

  getGroupDetails() {
    return this.databaseService.getAllGroupDetail().pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(data => {
      if (data[0].length !== 0 && data[1].length !== 0) {
        const newGroupDetails: GroupDetail[] = [];
        data[0].forEach(group => {
          const course = data[1].find(c => c.uid === group.course);
          newGroupDetails.push({
            uid: group.uid,
            name: group.name,
            courseUid: course.uid,
            courseCode: course.code,
            courseName: course.name
          });
        });
        this.groupDetails.next(newGroupDetails);
        this.getCourseWithGroup(data[0], data[1]);
      }
    });
  }

  getCourseWithGroup(groups: Group[], courses: Course[]) {
    const newCourse = courses;
    newCourse.forEach(course => {
      const group = groups.filter(g => g.course === course.uid);
      group.forEach(g => g.selected = false);
      course.groups = group;
      course.showGroup = false;
    });
    this.courseWithGroup.next(newCourse);
  }

  async getAllFile() {
    return this.databaseService.getAllFile().pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(data => {
      this.rubrics.next(data[0]);
      this.manuals.next(data[1]);
      this.schedules.next(data[2]);
      this.references.next(data[3]);
    });
  }

  updateFile(data: Files) {
    switch (this.uploadCategory) {
      case 'Rubric': {
        this.databaseService.updateRubric(data).finally(() => this.analyticService.logEvent('update-rubric', true));
        break;
      }
      case 'Manuals': {
        this.databaseService.updateManual(data).finally(() => this.analyticService.logEvent('update-rubric', true));
        break;
      }
      case 'Schedule': {
        this.databaseService.updateSchedule(data).finally(() => this.analyticService.logEvent('update-rubric', true));
        break;
      }
      case 'Reference': {
        this.databaseService.updateReference(data).finally(() => this.analyticService.logEvent('update-rubric', true));
        break;
      }
      default: {
        console.log('Invalid choice');
        break;
      }
    }
  }
}
