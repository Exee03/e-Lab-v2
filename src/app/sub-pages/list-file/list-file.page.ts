import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FileViewerPdfPage } from 'src/app/modal-pages/file-viewer-pdf/file-viewer-pdf.page';
import { Files, Items } from 'src/app/models/files';
import { CommonService } from 'src/app/services/common/common.service';
import { FileViewerPage } from 'src/app/modal-pages/file-viewer/file-viewer.page';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-list-file',
  templateUrl: './list-file.page.html',
  styleUrls: ['./list-file.page.scss'],
})
export class ListFilePage implements OnInit {
  lastPage = '';
  category = '';
  files = [];
  isEmpty = true;
  selectedRubric: Files;
  items: Items[] = [{
    id: 1,
    text: ''
  }];
  isStudent = true;

  constructor(
    private modalController: ModalController,
    private commonService: CommonService,
    private authService: AuthenticationService
  ) {
    this.files = this.commonService.files;
    this.authService.user$.pipe(first()).subscribe(user => {
      this.isStudent = (authService.isAdmin(user) || authService.isLecturer(user)) ? false : true;
    });
  }

  ngOnInit() {
  }

  checkEvent(file) {
    this.selectedRubric = file;
    if (file.items !== undefined) {
      this.items = file.items;
    } else {
      this.items = [{
        id: 1,
        text: ''
      }];
    }
    this.files.forEach(element => {
      if (element.uid === file.uid) {
        this.commonService.updateFile(element);
      } else {
        element.selected = false;
        this.commonService.updateFile(element);
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
    if (this.selectedRubric) {
      this.items.forEach(item => {
        item.text = this.commonService.capitalize(item.text);
      });
      this.selectedRubric.items = this.items;
      this.commonService.updateFile(this.selectedRubric);
      this.commonService.showToast('Updated!!!');
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
