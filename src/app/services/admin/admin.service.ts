import { Injectable } from '@angular/core';
import { User, Roles } from 'src/app/models/user';
import { DatabaseService } from '../database/database.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Course } from 'src/app/models/course';
import { Group } from 'src/app/models/group';
import { CommonService } from '../common/common.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  unsubscribeAdmin$ = new Subject<void>();
  users = new BehaviorSubject<User[]>([]);
  selectedCourse: Course;

  constructor(
    private databaseService: DatabaseService,
    private commonService: CommonService
  ) { }

  selectCourse(courseUid: string) {
    this.commonService.courseWithGroup.pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(courses => {
      this.selectedCourse = courses.find(course => course.uid === courseUid);
    });
  }

  async addCourse(code: string, name: string) {
    const data: Course = {
      name,
      code,
      group: 0
    };

    const result = await this.databaseService.addCourse(data);
    data.uid = result.id;
    this.databaseService.updateCourse(data);
  }

  async addGroup(name: string, student: number) {
    const data: Group = {
      name,
      student,
      course: this.selectedCourse.uid
    };

    const result = await this.databaseService.addGroup(data);
    data.uid = result.id;
    this.databaseService.updateGroup(data);
    this.databaseService.updateCourse({uid: this.selectedCourse.uid, group: this.selectedCourse.group + 1});
  }

  editCourse(code: string, name: string) {
    const data = {
      name,
      code
    };
    this.databaseService.updateCourse(data);
  }

  editGroup(groupUid: string, name: string, student: number) {
    const data: Group = {
      uid: groupUid,
      name,
      student,
      course: this.selectedCourse.uid
    };
    this.databaseService.updateGroup(data);
  }

  updateRole(user: User, selectedRole: string) {
    let role: Roles;
    switch (selectedRole) {
      case 'Admin':
        role = {
          admin: true,
          lecturer: false,
          student: false
        };
        break;
      case 'Lecturer':
        role = {
          admin: false,
          lecturer: true,
          student: false
        };
        break;
      case 'Student':
        role = {
          admin: false,
          lecturer: false,
          student: true
        };
        break;
      default:
        console.log('Invalid choice');
        break;
    }
    return this.databaseService.updateRole(user.uid, role).finally(() => this.commonService.showToast('Successfully update'));
  }

}
