import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportViewerPage } from './report-viewer.page';

describe('ReportViewerPage', () => {
  let component: ReportViewerPage;
  let fixture: ComponentFixture<ReportViewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportViewerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
