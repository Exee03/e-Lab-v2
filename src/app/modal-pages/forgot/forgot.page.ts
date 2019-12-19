import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {
  email = '';

  constructor(
    private modalController: ModalController,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private analyticService: AnalyticsService
  ) { }

  ngOnInit() {
  }

  async reset() {
    this.analyticService.logEvent('forgot', false);
    const { email } = this;
    try {
      this.authService.resetPassword(email).then(() => {
        this.closeForgot();
      });
    } catch (error) {
      this.commonService.showToast(error.message);
    }
  }

  async closeForgot() {
    await this.modalController.dismiss();
  }
}
