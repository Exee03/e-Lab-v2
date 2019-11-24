import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';
import { AdminService } from 'src/app/services/admin/admin.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.page.html',
  styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {

  group = '';
  student = 0;
  from = '';
  groupUid = '';

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private commonService: CommonService,
    private adminService: AdminService
    ) {
    this.group = this.navParams.get('group');
    this.student = this.navParams.get('student');
    this.from = this.navParams.get('from');
    this.groupUid = this.navParams.get('groupUid');
  }

  ngOnInit() {
  }

  submit() {
    if (this.from === 'Create') {
      this.commonService.showToast('Creating Group...').then(_ => {
        return this.adminService.addGroup(this.group.toUpperCase(), this.student);
      }).then(_ => {
        this.commonService.showToast('Successfully create your Group');
        this.closeGroup();
      });
    } else {
      this.commonService.showToast('Updating...').then(_ => {
        return this.adminService.editGroup(this.groupUid, this.group.toUpperCase(), this.student);
      }).then(_ => {
        this.commonService.showToast('Successfully update your Group');
        this.closeGroup();
      });
    }
  }

  async closeGroup() {
    await this.modalController.dismiss();
  }

}
