import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { StudentService } from 'src/app/services/student/student.service';
import { User } from 'src/app/models/user';
import { DatabaseService } from 'src/app/services/database/database.service';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-select-method',
  templateUrl: './select-method.page.html',
  styleUrls: ['./select-method.page.scss'],
})
export class SelectMethodPage implements OnInit {
  methods = ['Individual', 'Group'];
  from = '';
  user: User;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private studentService: StudentService,
    private databaseService: DatabaseService,
    private commonService: CommonService
  ) {
    this.from = this.navParams.get('from');
    this.user = this.navParams.get('user');
  }

  ngOnInit() {
  }

  selectMethod(method: string) {
    if (method === 'Individual') {
      this.studentService.inGroup.next(false);
    } else {
      this.studentService.inGroup.next(true);
      this.databaseService.getAllUser().pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(users => {
        this.studentService.groupMembers.next(users);
      }, error => this.commonService.showAlertError('Error!', '', error.message));
    }
    this.closeSelectMethod();
  }

  async closeSelectMethod() {
    await this.modalController.dismiss();
  }

}
