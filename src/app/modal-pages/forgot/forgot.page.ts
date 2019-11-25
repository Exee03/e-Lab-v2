import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';

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
    private commonService: CommonService
  ) { }

  ngOnInit() {
  }

  async reset() {
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
