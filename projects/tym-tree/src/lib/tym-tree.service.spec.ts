import { TestBed } from '@angular/core/testing';

import { TymTreeService } from './tym-tree.service';

describe('TymTreeService', () => {
  let service: TymTreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TymTreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
