import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';
import { LecturerService } from 'src/app/services/lecturer/lecturer.service';
import { takeUntil } from 'rxjs/operators';
import { DatabaseService } from 'src/app/services/database/database.service';
import { FileViewerPage } from 'src/app/modal-pages/file-viewer/file-viewer.page';
import { ViewProfilePage } from 'src/app/modal-pages/view-profile/view-profile.page';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  selectedPath = '';
  pages = [];
  options = [
    {
      title: 'Settings',
      url: '/menu/settings',
      icon: 'settings'
    },
    // {
    //   title: 'Help',
    //   url: '/menu/help',
    //   icon: 'help-circle-outline'
    // },
  ];
  user: User;
  username: string;
  // tslint:disable-next-line: max-line-length
  photoURL = 'https://firebasestorage.googleapis.com/v0/b/e-lab-b4105.appspot.com/o/e-lab%2Fdefault-user.png?alt=media&token=bbd6dc4a-b9ec-478f-b83a-add40e046d2d';
  role: string;
  id: string;
  items = [];
  totalMarkPercentage = 0;

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private modalController: ModalController,
    private authService: AuthenticationService,
    private analyticService: AnalyticsService,
    private lecturerService: LecturerService,
    private databaseService: DatabaseService
    ) {
      this.menuCtrl.enable(true, 'mainMenu');
      this.menuCtrl.enable(false, 'evaluation');
      this.router.events.subscribe((event: RouterEvent) => {
        this.selectedPath = event.url;
      });
      this.lecturerService.items.pipe(takeUntil(databaseService.unsubscribe$)).subscribe(items => {
        this.items = items;
      });
      this.lecturerService.totalMarkPercentage.pipe(takeUntil(databaseService.unsubscribe$)).subscribe(percent => {
        this.totalMarkPercentage = percent;
      });
   }

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(user => {
      if (user) {
        this.selectedPath = '/menu/dashboard';
        this.user = user;
        this.username = user.displayName;
        this.id = user.id;
        this.photoURL = user.photoURL;
        this.role = this.authService.getRole(user);
        this.pages = this.authService.getMenu(user);
      }
    });
  }

  mark(newItem: any, scale: any) {
    this.lecturerService.totalMark = 0;
    let numItem = 0;
    this.items.forEach(item => {
      numItem++;
      if (item.id === newItem.id) {
        item.mark = scale;
        this.lecturerService.totalMark = this.lecturerService.totalMark + (scale * item.weight);
      } else {
        this.lecturerService.totalMark =
          this.lecturerService.totalMark + (item.mark * item.weight);
      }
    });
    this.totalMarkPercentage = (this.lecturerService.totalMark / this.lecturerService.fullMark) * 100;
    this.lecturerService.totalMarkPercentage.next(Math.round(this.totalMarkPercentage));
  }

  async viewRubric() {
    this.analyticService.logEvent('open-rubric', false);
    const modal = await this.modalController.create({
      component: FileViewerPage,
      cssClass: 'wideModal',
      componentProps: {
        pages: this.lecturerService.rubric.page
      }
    });
    return await modal.present().finally(() => this.analyticService.logEvent('open-rubric', true));
  }

  openSettings() {
    this.analyticService.logEvent('view-profile', false);
  }

  async viewProfile() {
    const modal = await this.modalController.create({
      component: ViewProfilePage,
      componentProps: {
        user: this.user
      }
    });
    return await modal.present();
  }

  logout() {
    this.analyticService.logEvent('logout', false);
    this.authService.logout();
  }
}
