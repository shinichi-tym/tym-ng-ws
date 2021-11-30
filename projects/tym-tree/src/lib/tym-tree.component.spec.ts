import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TymTreeComponent } from './tym-tree.component';

describe('TymTreeComponent', () => {
  let component: TymTreeComponent;
  let fixture: ComponentFixture<TymTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TymTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TymTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
