import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { TymTableComponent, TYM_COL } from './tym-table.component';

describe('TymTableComponent', () => {
  let component: TymTableComponent;
  let fixture: ComponentFixture<TymTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ TymTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TymTableComponent);
    component = fixture.componentInstance;
    let col_num = 8;
    let row_num = 20;
    let cols: TYM_COL[] = [];
    for (let header_c = 0; header_c < col_num; header_c++) {
      cols.push({ title: "title-" + header_c });
    }
    component.cols = cols;
    let data: string[][] = [];
    for (let row_c = 0; row_c < row_num; row_c++) {
      let row: string[] = [];
      for (let header_c = 0; header_c < col_num; header_c++) {
        row.push("data-" + header_c);

      }
      data.push(row);
    }
    component.data = data;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
