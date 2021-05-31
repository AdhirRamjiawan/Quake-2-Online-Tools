import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PakExtractorComponent } from './pak-extractor.component';

describe('PakExtractorComponent', () => {
  let component: PakExtractorComponent;
  let fixture: ComponentFixture<PakExtractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PakExtractorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PakExtractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
