/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'ngx-tym-table',
  templateUrl: './tym-table.component.html',
  styleUrls: ['./tym-table.component.scss']
})

export class TymTableComponent implements OnInit, OnChanges {

  @Input() cols: number = 10;
  @Input() rows: number = 20;
  @Input() head: Head[] = [];
  @Input() data: Row[] = [];

  public head_data: Head[] = [];
  public rows_data: Row[] = [];

  constructor() { }

  ngOnInit(): void {
    console.log("ngOnInit");
    this.doDrow();
  }

  ngOnChanges(): void {
    console.log("ngOnChanges");
    this.doDrow();
  }

  private doDrow() {
    this.head_data = [];
    this.rows_data = [];
    for (let header_c = 0; header_c < this.cols; header_c++) {
      let header = new Head("title-" + header_c);
      this.head_data.push(header);
    }
    for (let row_c = 0; row_c < this.rows; row_c++) {
      let row = new Row();
      for (let col_c = 0; col_c < this.cols; col_c++) {
        row.cols.push("data-" + col_c);
      }
      this.rows_data.push(row);
    }
  }

}

export class Head {
  title: String = "";
  constructor(title: String) {
    this.title = title;
  }
}

export class Row {
  cols: String[] = [];
}
