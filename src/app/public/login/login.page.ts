import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CommonService } from 'src/app/services/common/common.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { ModalController } from '@ionic/angular';
import { ForgotPage } from 'src/app/modal-pages/forgot/forgot.page';
import { RegisterPage } from 'src/app/modal-pages/register/register.page';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AdditionalInfoPage } from 'src/app/modal-pages/additional-info/additional-info.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  // tslint:disable-next-line: ban-types
  email: String = '';
  // tslint:disable-next-line: ban-types
  password: String = '';
  unsubscribeLogin$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private analyticService: AnalyticsService
  ) {
    this.authService.requestInfo.pipe(takeUntil(this.unsubscribeLogin$)).subscribe(async user => {
      if (user !== null) {
        const modal = await this.modalController.create({
          component: AdditionalInfoPage,
          backdropDismiss: false,
          componentProps: {
            user
          }
        });
        return await modal.present();
      }
    });
  }

  async login() {
    this.analyticService.logEvent('login-password', false);
    const { email, password } = this;
    this.authService.login(email, password).catch(error => this.commonService.showAlertError('Error!', '', error));
  }

  google() {
    this.analyticService.logEvent('login-google', false);
    this.authService.google().catch(error => this.commonService.showAlertError('Error!', '', error));
  }

  async forgot() {
    const modal = await this.modalController.create({
      component: ForgotPage,
    });
    return await modal.present();
  }

  async register() {
    const modal = await this.modalController.create({
      component: RegisterPage,
    });
    return await modal.present();
  }

  ngOnInit() {}

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeLogin$.next();
    this.unsubscribeLogin$.complete();
  }
}
