import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { ToastController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';

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

  constructor(
    private authService: AuthenticationService,
    private commonService: CommonService,
    public toastController: ToastController
  ) {}

  async login() {
    const { email, password } = this;
    this.authService.login(email, password).catch(error => this.commonService.showAlertError('Error!', '', error));
  }

  google() {
    this.authService.google().catch(error => this.commonService.showAlertError('Error!', '', error));
  }

  ngOnInit() {}
}
