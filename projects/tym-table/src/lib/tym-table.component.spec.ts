import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TymTableComponent, Head, Row } from './tym-table.component';

describe('TymTableComponent', () => {
  let component: TymTableComponent;
  let fixture: ComponentFixture<TymTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TymTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TymTableComponent);
    component = fixture.componentInstance;
    let col_num = 12;
    let row_num = 40;
    for (let header_c = 0; header_c < col_num; header_c++) {
      let header = new Head("title-" + header_c);
      component.head.push(header);
    }
    for (let row_c = 0; row_c < row_num; row_c++) {
      let row = new Row();
      for (let header_c = 0; header_c < col_num; header_c++) {
        row.cols.push("data-" + header_c);

      }
      component.data.push(row);
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
