import { Component, OnInit } from '@angular/core';
import { Faculty } from 'src/app/models/faculty';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  displayName = '';
  fullName = '';
  phone = '';
  id = '';
  faculty = '';
  faculties: Faculty[] = [];
  unsubscribeRegister$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private analyticService: AnalyticsService
    ) {
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

  checkNumber(event: KeyboardEvent) {
    const pattern = /[0-9\+\-\ ]/;
    const allowedKeys = [
      'Backspace', 'ArrowLeft', 'ArrowRight', 'Escape', 'Tab'
  ];
    const inputChar = event.key;
    // tslint:disable-next-line: deprecation
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
    if (this.id !== undefined && !allowedKeys.includes(inputChar) ) {
      if (this.id.length > 9) {
        event.preventDefault();
      }
    }
  }

  async register() {
    this.analyticService.logEvent('register', false);
    const { email, password, confirmPassword, faculty, phone, id } = this;
    let { displayName, fullName } = this;
    displayName = this.commonService.capitalize(displayName);
    fullName = this.commonService.capitalize(fullName);
    if (displayName !== '' && fullName !== '' && email !== '' && password !== '' && confirmPassword !== '' && faculty !== '') {
      if (confirmPassword === password) {
        try {
          this.authService.isRegister = true;
          this.authService.register(email, password, displayName, fullName, faculty, phone, id).finally(() => this.closeRegister());
        } catch (error) {
          this.commonService.showToast(`Error!\n${error.message}\nPlease try again.`);
          console.dir(error);
        }
      } else {
        this.commonService.showToast('The password and confirmation password do not match.');
      }
    } else {
      this.commonService.showToast('Error!\nPlease fill out all field.');
    }
  }

  async closeRegister() {
    await this.modalController.dismiss();
  }


}
