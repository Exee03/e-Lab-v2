import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FileViewerPdfPage } from 'src/app/modal-pages/file-viewer-pdf/file-viewer-pdf.page';
import { Files, Items } from 'src/app/models/files';
import { CommonService } from 'src/app/services/common/common.service';
import { FileViewerPage } from 'src/app/modal-pages/file-viewer/file-viewer.page';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-list-file',
  templateUrl: './list-file.page.html',
  styleUrls: ['./list-file.page.scss'],
})
export class ListFilePage implements OnInit {
  category = '';
  files = [];
  isEmpty = true;
  selectedFile: Files;
  items: Items[] = [{
    id: 1,
    text: ''
  }];
  isStudent = true;
  unsubscribeListFile$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
    private authService: AuthenticationService
  ) {
    this.category = this.commonService.uploadCategory;
    this.commonService.files.pipe(takeUntil(this.unsubscribeListFile$)).subscribe(files => {
      this.getFiles(files);
    });
    this.authService.user$.pipe(first()).subscribe(user => {
      this.isStudent = (authService.isAdmin(user) || authService.isLecturer(user)) ? false : true;
    });
  }

  private getFiles(files: Files[]) {
    this.files = [];
    files.forEach((file: Files) => {
      if (file.course === this.commonService.selectedGroupDetail.courseUid) {
        this.isEmpty = false;
        this.files.push(file);
        if (file.selected !== false) {
          this.selectedFile = file;
          if (file.items !== undefined) {
            this.items = file.items;
          }
        }
      }
    });
  }

  ngOnInit() {
    if (this.files.length !== 0) {
      this.isEmpty = false;
    }
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {
    this.unsubscribeListFile$.next();
    this.unsubscribeListFile$.complete();
  }

  checkEvent(file) {
    this.selectedFile = file;
    if (file.items !== undefined) {
      this.items = file.items;
    } else {
      this.items = [{
        id: 1,
        text: ''
      }];
    }
    // tslint:disable-next-line: no-shadowed-variable
    this.files.forEach(file => {
      if (file.uid === file.uid) {
        this.commonService.updateFile(file);
      } else {
        file.selected = false;
        this.commonService.updateFile(file);
      }
    });
    this.commonService.showToast('Done updating...');
  }

  async viewFile(selectedFile) {
    const modal = await this.modalController.create({
      component: FileViewerPage,
      cssClass: 'wideModal',
      componentProps: {
        pages: selectedFile.page
      }
    });
    // this.analyticsService.logEvent('labContent-start', {method: 'references'});
    return await modal.present();
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      // tslint:disable-next-line: no-shadowed-variable
      reader.onload = (event: any) => {
        this.preview(event.target.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  addItem() {
    this.items.push({
      id: this.items.length + 1,
      text: ''
    });
  }

  removeItem(index: number) {
    const oldArray = this.items.splice(index);
    const remains = oldArray.slice(1, oldArray.length);
    this.items = this.items.concat(remains);
    // tslint:disable-next-line: no-shadowed-variable
    for (let index = 0; index < this.items.length; index++) {
      const element = this.items[index];
      element.id = index + 1;
    }
  }

  updateRubric() {
    if (this.selectedFile) {
      this.items.forEach(item => {
        item.text = this.commonService.capitalize(item.text);
      });
      this.selectedFile.items = this.items;
      this.commonService.updateFile(this.selectedFile);
      this.commonService.showToast('Successfully update.');
    } else {
      this.commonService.showAlert('No file', '', 'Please select file, then submit it again.');
    }
  }

  async preview(url) {
    const modal = await this.modalController.create({
      component: FileViewerPdfPage,
      // cssClass: 'wideModal',
      componentProps: {
        url
      }
    });
    return await modal.present();
  }

}
