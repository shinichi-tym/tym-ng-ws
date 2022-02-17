import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TymTableEditorComponent } from './tym-table-editor.component';

describe('TymTableEditorComponent', () => {
  let component: TymTableEditorComponent;
  let fixture: ComponentFixture<TymTableEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TymTableEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TymTableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
