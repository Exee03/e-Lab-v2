import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Data, Header } from 'src/app/models/report';
import { StudentService } from 'src/app/services/student/student.service';

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
    private studentService: StudentService
    ) {
      this.doc = this.navParams.get('docId');
      this.head = this.navParams.get('header');
      this.subHead = this.navParams.get('subHeader');
      this.data = this.navParams.get('initData');
      console.log('doc ', this.doc);
      console.log('head ', this.head);
      console.log('subHead ', this.subHead);
      console.log('data ', this.data);
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
        this.studentService.addHeaderData(this.doc, text, 'text', this.head);
      } else {
        this.studentService.addSubHeaderData(this.doc, text, 'text', this.subHead);
      }
    } else {
      this.studentService.editData(this.doc, text, this.data);
    }
    this.closeTextEditor();
  }

  async closeTextEditor() {
    await this.modalController.dismiss();
  }

}
