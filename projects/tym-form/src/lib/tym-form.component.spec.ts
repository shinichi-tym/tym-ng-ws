import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TymFormComponent } from './tym-form.component';

describe('TymFormComponent', () => {
  let component: TymFormComponent;
  let fixture: ComponentFixture<TymFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TymFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TymFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
