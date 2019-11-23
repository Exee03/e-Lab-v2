import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFilePage } from './select-file.page';

describe('SelectFilePage', () => {
  let component: SelectFilePage;
  let fixture: ComponentFixture<SelectFilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectFilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
