import { Component, OnInit, Input, Renderer2 } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { takeUntil } from 'rxjs/operators';
import { DatabaseService } from 'src/app/services/database/database.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('header') header: any;
  // tslint:disable-next-line: no-input-rename
  @Input('headerVerify') headerVerify: any;
  lastX: any;
  hasVerified = true;
  role: string;
  cards = [];

  constructor(
    private authService: AuthenticationService,
    private databaseService: DatabaseService,
    private renderer: Renderer2,
    ) {
      this.setupMenu();
    }

  ngOnInit() {
  }

  setupMenu() {
    this.authService.user$.pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(user => {
      if (user) {
        this.role = this.authService.getRole(user);
        this.hasVerified = this.authService.isEmailVerified.value;
        this.cards = this.authService.getCards(user);
        // this.authService.checkEditReport();
        // this.buildRecentlyCard(user);
      }
    });
  }

  async logScrolling($event) {
    if ($event.target.localName !== 'ion-content') {
      return;
    }

    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight =
      scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 80;
    const triggerDepth = (scrollHeight / 100) * targetPercent;
    const headerVerify = document.getElementById('headerVerify');
    let height = this.header.clientHeight;
    if (!this.hasVerified) {
      height = this.header.clientHeight - headerVerify.clientHeight;
    }
    if ($event.detail.scrollTop > Math.max(0, this.lastX)) {
      this.renderer.setStyle(this.header, 'margin-top', `-${height}px`);
      this.renderer.setStyle(this.header, 'transition', 'margin-top 400ms');
      if (!this.hasVerified) {
        headerVerify.classList.replace('hasVerified', 'overlay');
      }
    } else {
      this.renderer.setStyle(this.header, 'z-index', '-20');
      this.renderer.setStyle(this.header, 'margin-top', '0');
      this.renderer.setStyle(this.header, 'transition', 'margin-top 400ms');
      if (!this.hasVerified) {
        headerVerify.classList.replace('overlay', 'hasVerified');
      }
    }
    this.lastX = $event.detail.scrollTop;

    if (currentScrollDepth > triggerDepth) {
      this.renderer.setStyle(this.header, 'margin-top', `-${height}px`);
      this.renderer.setStyle(this.header, 'transition', 'margin-top 50ms');
      if (!this.hasVerified) {
        headerVerify.classList.replace('hasVerified', 'overlay');
      }
    }
  }

  scrollStart(header) {
    this.header = header.el;
  }

  logout() {
    this.authService.logout();
  }

}
