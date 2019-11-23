import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FileViewerPdfPage } from './file-viewer-pdf.page';

const routes: Routes = [
  {
    path: '',
    component: FileViewerPdfPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FileViewerPdfPage]
})
export class FileViewerPdfPageModule {}
