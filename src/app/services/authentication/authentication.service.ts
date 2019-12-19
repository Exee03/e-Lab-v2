import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { CommonService } from '../common/common.service';
import { Storage } from '@ionic/storage';
import { auth } from 'firebase/app';
import { DatabaseService } from '../database/database.service';
import { User } from 'src/app/models/user';
import { StudentService } from '../student/student.service';
import { LecturerService } from '../lecturer/lecturer.service';
import { AdminService } from '../admin/admin.service';
import { Router } from '@angular/router';
import { AnalyticsService } from '../analytics/analytics.service';
import * as firebase from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  user$: Observable<User>;
  authenticationState = new BehaviorSubject(false);
  isEmailVerified = new BehaviorSubject(true);
  enterApp = false;
  isRegister = false;
  requestInfo = new BehaviorSubject<firebase.User>(null);

  constructor(
    private afStore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private plt: Platform,
    private storage: Storage,
    private router: Router,
    private commonService: CommonService,
    private databaseService: DatabaseService,
    private studentService: StudentService,
    private lecturerService: LecturerService,
    private adminService: AdminService,
    private analyticService: AnalyticsService
  ) {
    this.plt.ready().then(async () => {
      this.checkToken();
      this.commonService.getAllFaculty();
      await commonService.getGroupDetails();
      this.getUser();
      this.getUserData();
    });
  }

  private getUserData() {
    this.user$.pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe((user: User) => {
      if (user) {
        this.isEmailVerified.next(this.afAuth.auth.currentUser.emailVerified);
        this.analyticService.initFirebaseAnalytic(user.uid);
        this.preparingData(user);
      }
    });
  }

  private preparingData(user: User) {
    if (this.isAdmin(user)) {
      // tslint:disable-next-line: max-line-length
      this.databaseService.getAllUser().pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(users => {
        this.adminService.users.next(users);
        this.showToast(false, user);
      }, error => this.commonService.showAlertError('Error!', '', error.message));
    } else if (this.isLecturer(user)) {
      // tslint:disable-next-line: max-line-length
      this.databaseService.getAllReportBySubmitWithUser().pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(data => {
        this.lecturerService.reports.next(data[0]);
        this.lecturerService.allEvaluate.next(data[1]);
        this.lecturerService.allStudentData.next(data[2]);
        this.lecturerService.allRubric.next(data[3]);
        this.showToast(false, user);
      }, error => this.commonService.showAlertError('Error!', '', error.message));
    } else {
      // tslint:disable-next-line: max-line-length
      this.databaseService.getReportByUser(user.uid).pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(reports => {
        this.storage.get('report-token').then(token => {
          // tslint:disable-next-line: no-unused-expression
          (token) ? this.router.navigate(['writing']) : null;
        });
        // tslint:disable-next-line: no-unused-expression
        (reports) ? this.studentService.reports.next(reports) : this.studentService.reports.next([]);
        this.showToast(false, user);
      }, error => this.commonService.showAlertError('Error!', '', error.message));
    }
  }

  private getUser() {
    this.user$ = this.afAuth.authState.pipe(switchMap(user => {
      if (user) {
        return this.afStore.doc<User>(`users/${user.uid}`).valueChanges();
      } else {
        return of(null);
      }
    }));
    return this.user$;
  }

  async register(email, password, displayName, fullName, faculty) {
    this.commonService.showToast('Signing up...');
    try {
      this.router.navigate(['/login']).then(async _ => {
        const credential = await this.afAuth.auth.createUserWithEmailAndPassword(
          email,
          password
        );
        const user: User = {
          uid: credential.user.uid,
          email: credential.user.email,
          provider: credential.additionalUserInfo.providerId,
          displayName,
          // phone,
          // id,
          fullName,
          faculty,
          report: 0,
          photoURL:
            // tslint:disable-next-line: max-line-length
            'https://firebasestorage.googleapis.com/v0/b/e-lab-b4105.appspot.com/o/e-lab%2Fdefault-user.png?alt=media&token=bbd6dc4a-b9ec-478f-b83a-add40e046d2d'
        };
        return this.saveUserData(user).then(async res => {
          this.isRegister = true;
          this.afAuth.auth.currentUser.sendEmailVerification();
          await this.commonService.showAlert(
            'Verification email sent!',
            `Hi & Welcome ${displayName}`,
            // tslint:disable-next-line: max-line-length
            `This action requires email verification. Please check your inbox and follow the instructions. Email sent to:\n${credential.user.email}`
          );
          this.analyticService.logEvent('register', true);
          // this.analyticsService.logEvent('register-done');
        });
      });
    } catch (error) {
      await this.commonService.showAlert('Oppsss...', '', error.message);
    }
  }

  sentEmailVerification() {
    return this.afAuth.auth.currentUser.sendEmailVerification();
  }

  async resetPassword(email) {
    try {
      await this.afAuth.auth.sendPasswordResetEmail(email);
      await this.commonService.showToast(
        'Forgot password email sent. Please check your email for reset the password'
      );
      this.analyticService.logEvent('forgot', true);
    } catch (error) {
      await this.commonService.showAlert('Oppsss...', '', error.message);
    }
  }

  async google() {
    const provider = new firebase.auth.GoogleAuthProvider();
    this.afAuth.auth.signInWithPopup(provider).then(credential => {
      this.analyticService.logEvent('login-google', false);
      return this.oAuthLogin(credential);
    }).catch(async error => {
      // this.commonService.loading(true, 'AuthService-oAuthLogin');
      await this.commonService.showAlert('Oppsss...', '', error.message);
    });
  }

  private oAuthLogin(credential: auth.UserCredential) {
    const usersRef = this.afStore
      .collection('users')
      .doc(credential.user.uid);
    usersRef.get().subscribe(async docSnapshot => {
      this.analyticService.logEvent('login-google', true);
      this.analyticService.logEvent('session', false);
      if (docSnapshot.exists === true) {
        this.enteringApp(credential.user.uid);
        this.updateLastSeen(credential);
      } else {
        // this.commonService.loading(true, 'AuthService-oAuthLogin');
        // tslint:disable-next-line: no-unused-expression
        // this.router.navigate(['/additional-info']);
        this.requestInfo.next(credential.user);
        this.updateLastSeen(credential);
      }
    });
  }

  async login(email, password) {
    this.commonService.showToast('Signing in...');
    // this.commonService.loading(false, 'AuthService-login');
    await this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(credential => {
        this.analyticService.logEvent('login-password', true);
        this.analyticService.logEvent('session', false);
        this.enteringApp(credential.user.uid);
        this.updateLastSeen(credential);
      })
      .catch(async error => {
        console.log(error);
        this.commonService.showToast(error.message).then(_ => {
          // this.commonService.loading(true, 'AuthService-login');
        });
      });
  }

  updateLastSeen(credential: firebase.auth.UserCredential) {
    const userRef = this.afStore.collection('users').doc(credential.user.uid);
    return userRef.update({ lastSeen: this.commonService.getTime() });
  }

  saveUserData(user: User) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(
      `users/${user.uid}`
    );
    const data: User = user;
    data.roles = {
      student: true
    };
    return userRef.set(data, { merge: true });
  }

  async showToast(firstTime: boolean, user: User) {
    let text = '';
    if (!this.enterApp && !this.isRegister) {
      // this.analyticsService.setUserId(this.user, this.getRole());
      // this.analyticsService.logEvent('login-done', {method: this.user.provider});
      if (firstTime === false) {
        if (user.provider === 'password') {
          const username = user.email.split('@', 1).toString();
          text = `Welcome back, ${username}`;
        } else {
          const username = user.displayName;
          text = `Welcome back, ${username}`;
        }
      } else {
        const username = user.displayName;
        text = `Hello & Welcome , ${username}`;
      }
      // this.commonService.loading(true, 'AuthService-showToast');
      this.enterApp = true;
      if (this.isEmailVerified.value !== true) {
        this.commonService.showAlert(
          'Oppsss...' ,
          `Hi ${user.displayName}`,
          'Your email still not verified. Please check your email for email verification.'
          );
      }
      return this.commonService.showToast(text);
    }
  }

  getRole(user: User): string {
    let role = 'Student';
    if (this.checkAuthorization(user, ['admin'])) {
      role = 'Admin';
    } else if (this.checkAuthorization(user, ['lecturer'])) {
      role = 'Lecturer';
    }
    return role;
  }

  isLecturer(user: User): boolean {
    const allowed = ['lecturer'];
    return this.checkAuthorization(user, allowed);
  }

  isAdmin(user: User): boolean {
    const allowed = ['admin'];
    return this.checkAuthorization(user, allowed);
  }

  canRead(user: User): boolean {
    const allowed = ['admin', 'lecturer', 'student'];
    return this.checkAuthorization(user, allowed);
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'lecturer'];
    return this.checkAuthorization(user, allowed);
  }

  canDelete(user: User): boolean {
    const allowed = ['admin'];
    return this.checkAuthorization(user, allowed);
  }

  checkAuthorization(user: User, allowedRoles: string[]): boolean {
    if (!user) {
      return false;
    }
    for (const role of allowedRoles) {
      if (user.roles[role]) {
        return true;
      }
    }
    return false;
  }

  isAuthenticated() {
    return this.authenticationState.value;
  }

  checkToken() {
    return this.storage.get('auth-token').then(res => {
      if (res) {
        this.commonService.showToast('Preparing data...');
        this.authenticationState.next(true);
      }
    });
  }

  enteringApp(userUid: string) {
    this.getUserData();
    this.storage.set('auth-token', userUid);
    // this.isEmailVerified.next(this.afAuth.auth.currentUser.emailVerified);
    this.authenticationState.next(true);
  }

  getMenu(user: User) {
    let menu = [];
    if (this.isAdmin(user)) {
      menu = [
        {
          title: 'Dashboard',
          url: '/menu/dashboard',
          icon: 'home'
        },
        {
          title: 'User Management',
          url: '/menu/user-management',
          icon: 'contacts'
        },
        {
          title: 'Register Class',
          url: '/menu/class',
          icon: 'add-circle'
        },
        {
          title: 'File Upload',
          url: '/menu/upload',
          icon: 'cloud-upload'
        },
      ];
    } else if (this.isLecturer(user)) {
      menu = [
        {
          title: 'Dashboard',
          url: '/menu/dashboard',
          icon: 'home'
        },
        {
          title: 'File Upload',
          url: '/menu/upload',
          icon: 'cloud-upload'
        },
        {
          title: 'Student Report',
          url: '/menu/student',
          icon: 'document'
        }
      ];
    } else {
      menu = [
        {
          title: 'Dashboard',
          url: '/menu/dashboard',
          icon: 'home'
        },
        {
          title: 'My Report',
          url: '/menu/my-report',
          icon: 'document'
        },
        {
          title: 'Lab Content',
          url: '/menu/lab',
          icon: 'filing'
        },
        {
          title: 'Report Writing',
          url: '/menu/report',
          icon: 'create'
        }
      ];
    }
    return menu;
  }

  getCards(user: User) {
    let cards = [];
    if (this.isAdmin(user)) {
      cards = [
        {
          title: 'User',
          subtitle: 'Management',
          icon: 'contacts',
          footer: 'MANAGE',
          url: '/menu/user-management'
        },
        {
          title: 'Upload',
          subtitle: 'File',
          icon: 'cloud-upload',
          footer: 'START NOW',
          url: '/menu/upload'
        },
        {
          title: 'Register',
          subtitle: 'Class',
          icon: 'add-circle',
          footer: 'ADD NOW',
          url: '/menu/class'
        },
      ];
    } else if (this.isLecturer(user)) {
      cards = [
        {
          title: 'Student',
          subtitle: 'Report',
          icon: 'document',
          footer: 'VIEW',
          url: '/menu/student'
        },
        {
          title: 'Upload',
          subtitle: 'File',
          icon: 'cloud-upload',
          footer: 'START NOW',
          url: '/menu/upload'
        }
      ];
    } else {
      cards = [
        {
          title: 'My',
          subtitle: 'Report',
          icon: 'document',
          footer: 'VIEW',
          url: '/menu/my-report'
        },
        {
          title: 'Docs',
          subtitle: 'Lab Content',
          icon: 'filing',
          footer: 'VIEW',
          url: '/menu/lab'
        },
        {
          title: 'Write',
          subtitle: 'Report',
          icon: 'add',
          footer: 'START NOW',
          url: '/menu/report'
        }
      ];
    }
    return cards;
  }

  logout() {
    this.analyticService.logEvent('logout', true);
    this.analyticService.logEvent('session', true);
    return this.afAuth.auth.signOut().finally(() => {
      this.databaseService.unsubscribe$.next(true);
      this.databaseService.unsubscribe$.complete();
      this.storage.remove('auth-token');
      this.analyticService.dispose();
      this.enterApp = false;
      this.authenticationState.next(false);
    });
  }
}
