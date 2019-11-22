import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluateReportPage } from './evaluate-report.page';

describe('EvaluateReportPage', () => {
  let component: EvaluateReportPage;
  let fixture: ComponentFixture<EvaluateReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluateReportPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluateReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
