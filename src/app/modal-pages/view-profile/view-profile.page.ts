import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.page.html',
  styleUrls: ['./view-profile.page.scss'],
})
export class ViewProfilePage implements OnInit {
  user: User;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private commonService: CommonService,
    private authService: AuthenticationService,
    private analyticService: AnalyticsService
  ) {
    this.user = this.navParams.get('user');
  }

  ngOnInit() {
  }

  async closeViewProfile() {
    await this.modalController.dismiss();
  }

}
