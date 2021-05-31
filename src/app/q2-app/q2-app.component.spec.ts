import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Q2AppComponent } from './q2-app.component';

describe('Q2AppComponent', () => {
  let component: Q2AppComponent;
  let fixture: ComponentFixture<Q2AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Q2AppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Q2AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
