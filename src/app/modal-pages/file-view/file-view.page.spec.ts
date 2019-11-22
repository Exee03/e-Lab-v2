import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileViewPage } from './file-view.page';

describe('FileViewPage', () => {
  let component: FileViewPage;
  let fixture: ComponentFixture<FileViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileViewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
