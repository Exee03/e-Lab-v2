import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WritingPage } from './writing.page';

describe('WritingPage', () => {
  let component: WritingPage;
  let fixture: ComponentFixture<WritingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WritingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WritingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
