import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePage } from './role.page';

describe('RolePage', () => {
  let component: RolePage;
  let fixture: ComponentFixture<RolePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RolePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
