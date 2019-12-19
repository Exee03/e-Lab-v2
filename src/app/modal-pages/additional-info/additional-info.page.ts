import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { ModalController, NavParams } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { CommonService } from 'src/app/services/common/common.service';
import { Faculty } from 'src/app/models/faculty';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-additional-info',
  templateUrl: './additional-info.page.html',
  styleUrls: ['./additional-info.page.scss'],
})
export class AdditionalInfoPage implements OnInit {
  user: firebase.User;
  faculties: Faculty[] = [];
  faculty = '';
  fullName = '';
  unsubscribeRegister$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private analyticService: AnalyticsService
  ) {
    this.user = this.navParams.get('user');
    this.commonService.faculties.pipe(takeUntil(this.unsubscribeRegister$)).subscribe(faculties => {
      this.faculties = faculties;
    });
  }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeRegister$.next();
    this.unsubscribeRegister$.complete();
  }

  optionsFn(faculty) {
    this.faculty = faculty;
  }

  update() {
    this.analyticService.logEvent('register-google', false);
    this.fullName = this.commonService.capitalize(this.fullName);
    const userData: User = {
      uid: this.user.uid,
      email: this.user.email,
      fullName: this.fullName,
      faculty: this.faculty,
      provider: 'google.com',
      displayName: this.user.displayName,
      photoURL: this.user.photoURL
    };
    this.authService.saveUserData(userData).finally(() => {
      this.analyticService.logEvent('register-google', true);
      this.authService.requestInfo.next(null);
      this.closeAdditionalInfo();
      this.authService.enteringApp(this.user.uid);
    });
  }

  async closeAdditionalInfo() {
    await this.modalController.dismiss();
  }

}
