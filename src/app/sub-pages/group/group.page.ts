import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { AdminService } from 'src/app/services/admin/admin.service';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoursePage } from 'src/app/modal-pages/course/course.page';
import { GroupPage as GroupPageModal } from 'src/app/modal-pages/group/group.page';
import { Group } from 'src/app/models/group';

@Component({
  selector: 'app-group',
  templateUrl: './group.page.html',
  styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {

  unsubscribe$ = new Subject<void>();
  groups = [];
  courseName = '';

  constructor(
    private commonService: CommonService,
    private adminService: AdminService,
    private modalController: ModalController
    ) {
    console.log(this.adminService.selectedCourse.uid);
    this.courseName = this.adminService.selectedCourse.name;
    this.commonService.courseWithGroup.pipe(takeUntil(this.unsubscribe$)).subscribe(courses => {
      this.groups = courses.find(course => course.uid === this.adminService.selectedCourse.uid).groups;
    });
  }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async addGroup() {
    const modal = await this.modalController.create({
      component: GroupPageModal,
      // cssClass: 'wideModal',
      componentProps: {
        group : '',
        student : 0,
        from : 'Create',
        groupUid: '',
      }
    });
    return await modal.present();
  }

  async editCourse() {
    const modal = await this.modalController.create({
      component: CoursePage,
      componentProps: {
        code: this.adminService.selectedCourse.code,
        name: this.adminService.selectedCourse.name,
        from: 'Edit'
      }
    });
    return await modal.present();
  }

  async editGroup(selectedGroup: Group) {
    const modal = await this.modalController.create({
      component: GroupPageModal,
      componentProps: {
        group : selectedGroup.name,
        student : selectedGroup.student,
        from : 'Edit',
        groupUid: selectedGroup.uid
      }
    });
    return await modal.present();
  }

}
