import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReportPage } from './my-report.page';

describe('MyReportPage', () => {
  let component: MyReportPage;
  let fixture: ComponentFixture<MyReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
