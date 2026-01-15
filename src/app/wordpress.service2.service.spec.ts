import { TestBed } from '@angular/core/testing';

import { WordpressService2Service } from './wordpress.service2.service';

describe('WordpressService2Service', () => {
  let service: WordpressService2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordpressService2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
