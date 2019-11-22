import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {

  // tslint:disable-next-line: ban-types
  email: String = '';
  // tslint:disable-next-line: ban-types
  password: String = '';
  // tslint:disable-next-line: ban-types
  confirmPassword: String = '';

  constructor(
    private authService: AuthenticationService,
    public toastController: ToastController
  ) {}

  async register() {
    const { email, password, confirmPassword } = this;
    if (confirmPassword === password) {
      const toast = await this.toastController.create({
        message: 'Error!\nPlease try again.',
        duration: 2000
      });
      try {
        this.authService.register(email, password);
      } catch (error) {
        toast.present();
        console.dir(error);
      }
    } else {
      const toast = await this.toastController.create({
        message: 'Password and Confirm Password does not match!',
        duration: 2000
      });
      toast.present();
    }
  }

  ngOnInit() {}
}
