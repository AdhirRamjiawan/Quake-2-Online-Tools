import { TestBed } from '@angular/core/testing';

import { PakExtractorServiceService } from './pak-extractor-service.service';

describe('PakExtractorServiceService', () => {
  let service: PakExtractorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PakExtractorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
