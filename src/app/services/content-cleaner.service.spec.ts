import { TestBed } from '@angular/core/testing';

import { ContentCleanerService } from './content-cleaner.service';

describe('ContentCleanerService', () => {
  let service: ContentCleanerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentCleanerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
