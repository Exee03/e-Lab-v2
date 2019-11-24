import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { User } from 'src/app/models/user';
import { first, takeUntil } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin/admin.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { GroupDetail } from 'src/app/models/group';
import { Subject } from 'rxjs';
import { Course } from 'src/app/models/course';
import { CoursePage } from 'src/app/modal-pages/course/course.page';

@Component({
  selector: 'app-class',
  templateUrl: './class.page.html',
  styleUrls: ['./class.page.scss'],
})
export class ClassPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  lastX: any;
  role = '';
  hasVerified = true;
  user: User;
  courses: Course[] = [];
  unsubscribeGroupDetails$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private modalController: ModalController,
    private authService: AuthenticationService,
    private adminService: AdminService,
    private commonService: CommonService
  ) {
    this.hasVerified = this.authService.isEmailVerified.value;
    this.authService.user$.pipe(first()).subscribe(user => {
      this.user = user;
      this.role = this.authService.getRole(user);
    });
    this.commonService.courseWithGroup.pipe(takeUntil(this.unsubscribeGroupDetails$)).subscribe(courses => {
      this.courses = courses;
    });
  }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeGroupDetails$.next();
    this.unsubscribeGroupDetails$.complete();
  }

  async logScrolling($event) {
    if ($event.target.localName !== 'ion-content') {
      return;
    }

    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    const triggerDepth = ((scrollHeight / 100) * targetPercent);
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

  async addCourse() {
    const modal = await this.modalController.create({
      component: CoursePage,
      // cssClass: 'wideModal',
      componentProps: {
        code: '',
        name: '',
        from: 'Create'
      }
    });
    return await modal.present();
  }

  openCourse(courseUid: string) {
    this.adminService.selectCourse(courseUid);
    this.router.navigate(['/group']);
  }

}
