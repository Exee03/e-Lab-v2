import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './public/login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './public/register/register.module#RegisterPageModule' },
  {
    path: 'menu',
    canActivate: [AuthGuardService],
    loadChildren: './pages/menu/menu.module#MenuPageModule'
  },
  { path: 'writing', loadChildren: './sub-pages/writing/writing.module#WritingPageModule' },
  { path: 'text-editor', loadChildren: './modal-pages/text-editor/text-editor.module#TextEditorPageModule' },
  { path: 'image-viewer', loadChildren: './modal-pages/image-viewer/image-viewer.module#ImageViewerPageModule' },
  { path: 'report-viewer', loadChildren: './modal-pages/report-viewer/report-viewer.module#ReportViewerPageModule' },
  { path: 'select-course', loadChildren: './modal-pages/select-course/select-course.module#SelectCoursePageModule' },
  { path: 'create-report', loadChildren: './modal-pages/create-report/create-report.module#CreateReportPageModule' },
  { path: 'my-report-detail', loadChildren: './sub-pages/my-report-detail/my-report-detail.module#MyReportDetailPageModule' },
  { path: 'select-file', loadChildren: './sub-pages/select-file/select-file.module#SelectFilePageModule' },
  { path: 'list-file', loadChildren: './sub-pages/list-file/list-file.module#ListFilePageModule' },
  { path: 'file-viewer-pdf', loadChildren: './modal-pages/file-viewer-pdf/file-viewer-pdf.module#FileViewerPdfPageModule' },
  { path: 'file-viewer', loadChildren: './modal-pages/file-viewer/file-viewer.module#FileViewerPageModule' },
  { path: 'edit-profile', loadChildren: './modal-pages/edit-profile/edit-profile.module#EditProfilePageModule' },
  { path: 'course', loadChildren: './modal-pages/course/course.module#CoursePageModule' },
  { path: 'group-modal', loadChildren: './modal-pages/group/group.module#GroupPageModule' },
  { path: 'group', loadChildren: './sub-pages/group/group.module#GroupPageModule' },
  { path: 'role', loadChildren: './modal-pages/role/role.module#RolePageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
