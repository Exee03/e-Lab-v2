import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthenticationService } from './services/authentication/authentication.service';
import { Router } from '@angular/router';
import { AnalyticsService } from './services/analytics/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthenticationService,
    private analyticService: AnalyticsService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
      this.analyticService.init();
      this.authService.authenticationState.subscribe(state => {
        console.log('Auth changed: ', state);
        if (state) {
          this.router.navigate(['menu']);
          // this.router.dispose();
        } else {
          this.router.navigate(['login']);
        }
      });
    });
  }
}
