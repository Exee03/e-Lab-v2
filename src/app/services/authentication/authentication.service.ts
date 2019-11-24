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

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  user$: Observable<User>;
  authenticationState = new BehaviorSubject(false);
  isEmailVerified = new BehaviorSubject(true);
  enterApp = false;
  isRegister = false;

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
  ) {
    this.plt.ready().then(async () => {
      this.checkToken();
      await commonService.getGroupDetails();
      this.getUser();
      this.getUserData();
    });
  }

  private getUserData() {
    this.user$.pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe((user: User) => {
      if (user) {
        this.isEmailVerified.next(this.afAuth.auth.currentUser.emailVerified);
        this.preparingData(user);
      }
    });
  }

  private preparingData(user: User) {
    if (this.isAdmin(user)) {
      // tslint:disable-next-line: max-line-length
      this.databaseService.getAllUser().pipe(takeUntil(this.databaseService.unsubscribe$)).subscribe(users => {
        this.adminService.users = users;
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

  async register(email, password) {
    this.isRegister = true;
    const user = await this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    let text = '';
    const username = user.user.email.split('@', 1);
    text = `Hello & Welcome ${username}`;
    await this.commonService.showToast(text);
    return this.storage.set('auth-token', user.user.uid).then(res => {
      this.authenticationState.next(true);
    });
  }

  sentEmailVerification() {
    return this.afAuth.auth.currentUser.sendEmailVerification();
  }

  async google() {
    const user = await this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    let text = '';
    const username = user.user.displayName;
    text = `Welcome back, ${username}`;
    this.commonService.showToast(text);
    return this.storage.set('auth-token', user.user.uid).then(res => {
      this.authenticationState.next(true);
    });
  }

  async login(email, password) {
    this.commonService.showToast('Sign in...');
    // this.commonService.loading(false, 'AuthService-login');
    await this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(credential => {
        this.updateUser(credential);
        this.enteringApp(credential.user.uid);
      })
      .catch(async error => {
        console.log(error);
        this.commonService.showToast(error.message).then(_ => {
          // this.commonService.loading(true, 'AuthService-login');
        });
      });
  }

  updateUser(credential: firebase.auth.UserCredential) {
    // tslint:disable-next-line: max-line-length
    let photoURL = 'https://firebasestorage.googleapis.com/v0/b/e-lab-b4105.appspot.com/o/e-lab%2Fdefault-user.png?alt=media&token=bbd6dc4a-b9ec-478f-b83a-add40e046d2d';
    if (credential.user.photoURL !== undefined) {
      photoURL = credential.user.photoURL;
    }
    // this.user = {
    //   provider: credential.additionalUserInfo.providerId,
    //   uid: credential.user.uid,
    //   phone: credential.user.phoneNumber,
    //   email: credential.user.email,
    //   displayName: credential.user.displayName,
    //   photoURL
    // };
  }

  updateLastSeen(user: User) {
    const userRef = this.afStore.collection('users').doc(user.uid);
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
      this.updateLastSeen(user);
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
    return this.afAuth.auth.signOut().finally(() => {
      this.databaseService.unsubscribe$.next();
      this.databaseService.unsubscribe$.complete();
      this.storage.remove('auth-token');
      this.enterApp = false;
      this.authenticationState.next(false);
    });
  }
}
