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
  { path: 'file-view', loadChildren: './modal-pages/file-view/file-view.module#FileViewPageModule' },
  { path: 'writing', loadChildren: './sub-pages/writing/writing.module#WritingPageModule' },
  { path: 'text-editor', loadChildren: './modal-pages/text-editor/text-editor.module#TextEditorPageModule' },
  { path: 'image-viewer', loadChildren: './modal-pages/image-viewer/image-viewer.module#ImageViewerPageModule' },
  { path: 'report-viewer', loadChildren: './modal-pages/report-viewer/report-viewer.module#ReportViewerPageModule' },
  { path: 'select-course', loadChildren: './modal-pages/select-course/select-course.module#SelectCoursePageModule' },
  { path: 'create-report', loadChildren: './modal-pages/create-report/create-report.module#CreateReportPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
