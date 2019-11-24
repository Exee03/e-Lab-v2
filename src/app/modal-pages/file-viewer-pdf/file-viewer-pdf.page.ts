import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CommonService } from 'src/app/services/common/common.service';
import { LecturerService } from 'src/app/services/lecturer/lecturer.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.min.js';


@Component({
  selector: 'app-file-viewer-pdf',
  templateUrl: './file-viewer-pdf.page.html',
  styleUrls: ['./file-viewer-pdf.page.scss'],
})
export class FileViewerPdfPage implements OnInit {
  pdfFile = null;
  pdfUrl;
  viewer;
  scale = 1;
  pages = [];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private storage: AngularFireStorage,
    private commonService: CommonService,
    private lecturerService: LecturerService
  ) {
    this.pdfUrl = this.navParams.get('url');
  }

  ngOnInit() {
    this.commonService.showToast('Preparing data...');
    this.showPDF(this.pdfUrl);
  }

  showPDF(url) {
    pdfjsLib.getDocument(url).promise.then(pdf => {
        this.pdfFile = pdf;
        this.viewer = document.getElementById('pdf-viewer');

        for (let page = 1; page <= pdf.numPages; page++) {
          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-page-canvas';
          this.viewer.appendChild(canvas);
          this.renderPage(page, canvas);
          if (page === pdf.numPages) {
            this.commonService.showToast('Done...');
          }
        }
    });
  }

  renderPage(pageNumber, canvas) {
    this.pdfFile.getPage(pageNumber).then(page => {
      const viewport = page.getViewport(this.scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({canvasContext: canvas.getContext('2d'), viewport}).then(res => {
        this.pages.push({pageNumber, canvas});
      });
    });
  }

  uploadToStorage() {
    let totalPage = 0;
    this.commonService.showToast('Uploading...');
    this.lecturerService.addFile().then(docUid => {
      const page = [];
      this.pages.forEach(element => {
        element.canvas.toBlob(blob => {
          const filePath = `${this.commonService.uploadCategory}/${docUid}/${element.pageNumber}.png`;
          const fileRef = this.storage.ref(filePath);
          const task = this.storage.upload(filePath, blob);
          // get notified when the download URL is available
          task.snapshotChanges().pipe(
            finalize(async () => {
              const url = await fileRef.getDownloadURL().toPromise();
              page.push({
                num: element.pageNumber,
                url
              });
              totalPage++;
              if (totalPage === this.pages.length) {
                this.commonService.showToast('successfully upload.');
                const arraySort = [];
                // tslint:disable-next-line: prefer-for-of
                for (let index = 1; index <= page.length; index++) {
                  page.forEach(item => {
                    if (item.num === index) {
                      arraySort.push(item);
                    }
                  });
                }
                console.log(arraySort);
                this.lecturerService.updateFile(docUid, arraySort);
              }
            } )
          ).subscribe();
        });
      });
    });
    this.closeFileViewerPdf();
  }

  async closeFileViewerPdf() {
    await this.modalController.dismiss();
  }

}
