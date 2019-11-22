import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCoursePage } from './select-course.page';

describe('SelectCoursePage', () => {
  let component: SelectCoursePage;
  let fixture: ComponentFixture<SelectCoursePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCoursePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCoursePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
