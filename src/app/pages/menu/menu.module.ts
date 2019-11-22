import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/menu/dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: MenuPage,
    children: [
      { path: 'dashboard', loadChildren: '../dashboard/dashboard.module#DashboardPageModule' },
      { path: 'lab', loadChildren: '../lab/lab.module#LabPageModule' },
      { path: 'report', loadChildren: '../report/report.module#ReportPageModule' },
      { path: 'settings', loadChildren: '../settings/settings.module#SettingsPageModule' },
      { path: 'student', loadChildren: '../student/student.module#StudentPageModule' },
      { path: 'class', loadChildren: '../class/class.module#ClassPageModule' },
      { path: 'my-report', loadChildren: '../my-report/my-report.module#MyReportPageModule' },
      { path: 'upload', loadChildren: '../upload/upload.module#UploadPageModule' },
      { path: 'user-management', loadChildren: '../user-management/user-management.module#UserManagementPageModule' },
      { path: 'evaluate-report', loadChildren: '../../sub-pages/evaluate-report/evaluate-report.module#EvaluateReportPageModule' },
      { path: 'help', loadChildren: '../help/help.module#HelpPageModule' },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
