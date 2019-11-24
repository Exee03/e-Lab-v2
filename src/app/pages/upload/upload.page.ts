import { Component, OnInit, Renderer2, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CommonService } from 'src/app/services/common/common.service';
import { SelectCoursePage } from 'src/app/modal-pages/select-course/select-course.page';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { takeUntil, first } from 'rxjs/operators';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
})
export class UploadPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  lastX: any;
  user: User;
  role = '';
  hasVerified = true;
  categories = [
    {
      title: 'Rubric',
      icon: 'checkbox-outline',
    },
    {
      title: 'Manuals',
      icon: 'list-box',
    },
    {
      title: 'Schedule',
      icon: 'Calendar',
    },
    {
      title: 'Reference',
      icon: 'book',
    }
  ];
  private unsubscribeFiles$ = new Subject<void>();
  files = [];

  constructor(
    private renderer: Renderer2,
    private modalController: ModalController,
    private authService: AuthenticationService,
    private commonService: CommonService
  ) {
    this.hasVerified = this.authService.isEmailVerified.value;
    this.authService.user$.pipe(first()).subscribe(user => {
      this.user = user;
      this.role = this.authService.getRole(user);
    });
  }

  ngOnInit() {
    this.commonService.getAllFile();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeFiles$.next();
    this.unsubscribeFiles$.complete();
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

  async openCategory(category: string) {
    this.getFile(category);
    this.commonService.uploadCategory = category;
    const modal = await this.modalController.create({
      component: SelectCoursePage,
      componentProps: {
        user: this.user,
        from: 'select-file'
      }
    });
    return await modal.present();
  }

  private getFile(category: string) {
    switch (category) {
      case 'Rubric': {
        this.commonService.rubrics.pipe(takeUntil(this.unsubscribeFiles$)).subscribe(files => this.commonService.files.next(files));
        break;
      }
      case 'Manuals': {
        this.commonService.manuals.pipe(takeUntil(this.unsubscribeFiles$)).subscribe(files => this.commonService.files.next(files));
        break;
      }
      case 'Schedule': {
        this.commonService.schedules.pipe(takeUntil(this.unsubscribeFiles$)).subscribe(files => this.commonService.files.next(files));
        break;
      }
      case 'Reference': {
        this.commonService.references.pipe(takeUntil(this.unsubscribeFiles$)).subscribe(files => this.commonService.files.next(files));
        break;
      }
      default: {
        console.log('Invalid choice');
        break;
      }
    }
  }

}
