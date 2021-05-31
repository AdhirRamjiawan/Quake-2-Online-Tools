import { TestBed } from '@angular/core/testing';

import { PakExtractorService } from './pak-extractor-service.service';

describe('PakExtractorServiceService', () => {
  let service: PakExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PakExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
