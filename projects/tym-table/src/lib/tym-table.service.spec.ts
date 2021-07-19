import { TestBed } from '@angular/core/testing';

import { TymTableService } from './tym-table.service';

describe('TymTableService', () => {
  let service: TymTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TymTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
