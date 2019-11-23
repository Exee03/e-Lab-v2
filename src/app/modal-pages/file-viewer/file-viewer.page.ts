import { Component, OnInit } from '@angular/core';
import { Page } from 'src/app/models/files';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.page.html',
  styleUrls: ['./file-viewer.page.scss'],
})
export class FileViewerPage implements OnInit {
  pages: Page[];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
    ) {
    this.pages = this.navParams.get('pages');
  }

  ngOnInit() {
  }

  async closeFileView() {
    await this.modalController.dismiss();
  }

}
