import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorPage } from './text-editor.page';

describe('TextEditorPage', () => {
  let component: TextEditorPage;
  let fixture: ComponentFixture<TextEditorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextEditorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
