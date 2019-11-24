import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { ModalController, NavParams } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin/admin.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.page.html',
  styleUrls: ['./role.page.scss'],
})
export class RolePage implements OnInit {
  user: User;
  roles = ['Admin', 'Lecturer', 'Student'];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private adminService: AdminService,
    private commonService: CommonService
  ) {
    this.user = this.navParams.get('user');
  }

  ngOnInit() {
  }

  async selectRole(role: string) {
    this.commonService.showToast(`Updating user's role...`);
    await this.modalController.dismiss().then(_ => {
      this.adminService.updateRole(this.user, role);
    });
  }

  async closeChangeRole() {
    await this.modalController.dismiss();
  }

}
