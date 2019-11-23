import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileViewerPdfPage } from './file-viewer-pdf.page';

describe('FileViewerPdfPage', () => {
  let component: FileViewerPdfPage;
  let fixture: ComponentFixture<FileViewerPdfPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileViewerPdfPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileViewerPdfPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
