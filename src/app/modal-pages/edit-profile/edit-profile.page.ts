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

  update() {
    this.analyticService.logEvent('edit-profile', false);
    this.commonService.showToast('Updating...');
    this.user.fullName = this.commonService.capitalize(this.user.fullName);
    this.user.displayName = this.commonService.capitalize(this.user.displayName);
    this.authService.saveUserData(this.user).then(() => this.closeEditProfile()).finally(() => {
      this.commonService.showToast('Your new information has been updated.');
      this.analyticService.logEvent('edit-profile', true);
    });
  }

  async closeEditProfile() {
    await this.modalController.dismiss();
  }

}
