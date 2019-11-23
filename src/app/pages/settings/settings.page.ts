import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { User } from 'src/app/models/user';
import { GroupDetail } from 'src/app/models/group';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CommonService } from 'src/app/services/common/common.service';
import { first } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { EditProfilePage } from 'src/app/modal-pages/edit-profile/edit-profile.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  lastX: any;
  hasVerified = true;
  user: User;
  roleLabel = '';
  photoURL = '';
  email = '';
  fullName = '';
  selectGroup: GroupDetail[];

  constructor(
    private modalController: ModalController,
    private renderer: Renderer2,
    public authService: AuthenticationService,
    private commonService: CommonService,
    ) {
      this.hasVerified = this.authService.isEmailVerified.value;
      this.authService.user$.pipe(first()).subscribe(user => {
        this.user = user;
        this.roleLabel = this.authService.getRole(user);
        this.photoURL = user.photoURL;
        this.email = user.email;
        this.fullName = user.fullName;
      });
    }

  ngOnInit() {
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


  verifyEmail() {
    return this.authService.sentEmailVerification().then(_ => this.commonService.showAlert(
      'Verification email sent!',
      ``,
      `Please check your inbox and follow the instructions.\nEmail sent to:\n${this.user.email}`
    )).catch(error => {
      this.commonService.showToast(error.message);
    });
  }

  async editProfile() {
    await this.commonService.getAllFaculty();
    const modal = await this.modalController.create({
      component: EditProfilePage,
      componentProps: {
        user: this.user
      }
    });
    return await modal.present();
  }

}
