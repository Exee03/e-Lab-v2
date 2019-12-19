import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { Faculty } from 'src/app/models/faculty';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit, OnDestroy {
  user: User;
  faculties: Faculty[] = [];
  unsubscribeListFaculty$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private analyticService: AnalyticsService
  ) {
    this.user = this.navParams.get('user');
    this.commonService.faculties.pipe(takeUntil(this.unsubscribeListFaculty$)).subscribe(faculties => {
      this.faculties = faculties;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribeListFaculty$.next();
    this.unsubscribeListFaculty$.complete();
  }

  optionsFn(faculty) {
    this.user.faculty = faculty;
  }

  checkNumber(event: KeyboardEvent) {
    const pattern = /[0-9\+\-\ ]/;
    const allowedKeys = [
      'Backspace', 'ArrowLeft', 'ArrowRight', 'Escape', 'Tab'
  ];
    const inputChar = event.key;
    // tslint:disable-next-line: deprecation
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
    if (this.user.id !== undefined && !allowedKeys.includes(inputChar) ) {
      if (this.user.id.length > 9) {
        event.preventDefault();
      }
    }
  }

  update() {
    if (this.user.id !== undefined) {
      if (this.user.id.length < 10) {
        this.commonService.showToast('Please fill in the full Matrix number');
      } else {
        // tslint:disable-next-line: max-line-length
        if (this.user.fullName !== '' && this.user.displayName !== '' && this.user.faculty !== '' && this.user.phone !== '' && this.user.email !== '') {
          this.analyticService.logEvent('edit-profile', false);
          this.commonService.showToast('Updating...');
          this.user.fullName = this.commonService.capitalize(this.user.fullName);
          this.user.displayName = this.commonService.capitalize(this.user.displayName);
          this.authService.saveUserData(this.user).then(() => this.closeEditProfile()).finally(() => {
            this.commonService.showToast('Your new information has been updated.');
            this.analyticService.logEvent('edit-profile', true);
          });
        } else {
          this.commonService.showToast('Please fill in the blank field');
        }
      }
    } else {
      this.commonService.showToast('Please fill in the blank field');
    }
  }

  async closeEditProfile() {
    await this.modalController.dismiss();
  }

}
