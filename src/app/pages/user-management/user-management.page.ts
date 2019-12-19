import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { first, takeUntil } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { AdminService } from 'src/app/services/admin/admin.service';
import { Subject } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { RolePage } from 'src/app/modal-pages/role/role.page';
import { ViewProfilePage } from 'src/app/modal-pages/view-profile/view-profile.page';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
})
export class UserManagementPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  lastX: any;
  role = '';
  hasVerified = true;
  users: User[] = [];
  unsubscribeUsers$ = new Subject<void>();
  textFilter = '';

  constructor(
    private renderer: Renderer2,
    private modalController: ModalController,
    private authService: AuthenticationService,
    private adminService: AdminService
  ) {
    this.hasVerified = this.authService.isEmailVerified.value;
    this.authService.user$.pipe(first()).subscribe(user => {
      this.role = this.authService.getRole(user);
    });
    this.adminService.users.pipe(takeUntil(this.unsubscribeUsers$)).subscribe(users => {
      users.forEach(user => user.roleLabel = this.authService.getRole(user));
      this.users = users;
    });
  }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeUsers$.next();
    this.unsubscribeUsers$.complete();
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

  async changeRole(user: User) {
    const modal = await this.modalController.create({
      component: RolePage,
      // cssClass: 'wideModal',
      componentProps: {
        user
      }
    });
    return await modal.present();
  }

  filterUser(event) {
    const text: string = event.target.value;
    this.textFilter = text;
  }

  async viewProfile(user: User) {
    const modal = await this.modalController.create({
      component: ViewProfilePage,
      componentProps: {
        user
      }
    });
    return await modal.present();
  }

}
