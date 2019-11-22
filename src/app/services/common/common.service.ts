import { Injectable } from '@angular/core';
import { ToastController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { DatabaseService } from '../database/database.service';
import { takeUntil } from 'rxjs/operators';
import { GroupDetail, Group } from 'src/app/models/group';
import { Course } from 'src/app/models/course';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  studentReport = new BehaviorSubject(0);
  lecturerReport = new BehaviorSubject(0);
  groupDetails = new BehaviorSubject<GroupDetail[]>([]);
  courseWithGroup = new BehaviorSubject<Course[]>([]);

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private platform: Platform,
    private storage: Storage,
    private databaseService: DatabaseService
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
}
