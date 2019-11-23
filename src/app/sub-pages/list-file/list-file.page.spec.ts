import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFilePage } from './list-file.page';

describe('ListFilePage', () => {
  let component: ListFilePage;
  let fixture: ComponentFixture<ListFilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListFilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
