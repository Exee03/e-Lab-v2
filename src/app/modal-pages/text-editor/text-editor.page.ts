import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Data, Header } from 'src/app/models/report';
import { StudentService } from 'src/app/services/student/student.service';
import { AnalyticsService } from 'src/app/services/analytics/analytics.service';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.page.html',
  styleUrls: ['./text-editor.page.scss'],
})
export class TextEditorPage implements OnInit {
  @Input() docId: string;
  @Input() header: Header;
  @Input() subHeader: Header;
  @Input() initData: string;

  editorForm: FormGroup;
  doc: string;
  head: Header;
  subHead: Header;
  data: Data;
  newText = true;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private studentService: StudentService,
    private analyticService: AnalyticsService
    ) {
      this.doc = this.navParams.get('docId');
      this.head = this.navParams.get('header');
      this.subHead = this.navParams.get('subHeader');
      this.data = this.navParams.get('initData');
  }

  ngOnInit() {
    this.editorForm = new FormGroup({
      editor: new FormControl(this.data.data)
    });
    if (this.data.data !== undefined) {
        this.newText = false;
    } else {
        this.newText = true;
    }
  }

  onSubmit() {
    const text = this.editorForm.get('editor').value;
    if (this.newText) {
      if (this.subHead === undefined) {
        this.analyticService.logEvent('add-text-header', false);
        this.studentService.addHeaderData(this.doc, text, 'text', this.head);
      } else {
        this.analyticService.logEvent('add-text-subHeader', false);
        this.studentService.addSubHeaderData(this.doc, text, 'text', this.subHead);
      }
    } else {
      this.analyticService.logEvent('edit-text', false);
      this.studentService.editData(this.doc, text, this.data);
    }
    this.closeTextEditor();
  }

  async closeTextEditor() {
    await this.modalController.dismiss();
  }

}
