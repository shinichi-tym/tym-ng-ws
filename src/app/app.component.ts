import { Component, Output } from '@angular/core';
import { CUSTOM, DEFS } from 'projects/tym-table/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tym-ng-ws';
  private save_col_num: number = 0;
  private save_row_num: number = 0;

  @Output() custom: CUSTOM = {}
  @Output() defs: DEFS | any = null;
  @Output() data: any[][] | any = null;

  /** size 0x0 */
  fnc0x0(): void {
    this.defs = null;
    this.data = [];
    this.save_col_num = 0;
    this.save_row_num = 0;
    console.log("fnc0x0");
  }

  /** size 1x1 */
  fnc1x1(): void {
    this.defs = {
      cols: [
        { title: "単価", align: "right" }
      ]
    }
    this.data = [
      [980],
    ];
    this.save_col_num = 1;
    this.save_row_num = 1;
    console.log("fnc1x1");
  }

  /** size 1x1 width:100 */
  fnc1x1w100(): void {
    this.defs = {
      cols: [
        { title: "単価", width: "100px", align: "right" }
      ]
    }
    this.data = [
      [980],
    ];
    this.save_col_num = 1;
    this.save_row_num = 1;
    console.log("fnc1x1w100");
  }

  /** size 3x3 width */
  fnc3x3(): void {
    this.defs = {
      cols: [
        { title: "単価", width: "10rem", align: "right" },
        { title: "販売数", width: "8rem", align: "right" },
        { title: "売上", width: "12rem", align: "right" }
      ]
    }
    this.data = [
      [980, 627, 614460],
      [1980, 1219, 2413620],
      [2980, 116, 345680]
    ];
    this.save_col_num = 3;
    this.save_row_num = 3;
    console.log("fnc3x3");
  }

  _mkdefs(cols: number): DEFS {
    let defs: DEFS = { cols: [] }
    for (let index_c = 0; index_c < cols; index_c++) {
      let wordnum: number = Math.floor(Math.random() * 3) + 1;
      let headsize: number = Math.floor(Math.random() * 5) + 5;
      let words: string = '';
      for (let index = 0; index < wordnum; index++) {
        words += ' ' + Math.random().toString(36).replace(/[^a-z]+/g, '')
          .substr(0, (Math.floor(Math.random() * 8) + 3));
      }
      defs.cols.push({ title: words.substring(1), width: headsize + "rem" });
    }
    return defs;
  }

  _mkdata(cols: number, rows: number): (string[][]) {
    let data: string[][] = [];
    for (let index_r = 0; index_r < rows; index_r++) {
      let row = [];
      for (let index_c = 0; index_c < cols; index_c++) {
        let wordnum: number = Math.floor(Math.random() * 3) + 1;
        let words: string = '';
        for (let index = 0; index < wordnum; index++) {
          words += ' ' + Math.random().toString(36).replace(/[^a-z]+/g, '')
            .substr(0, (Math.floor(Math.random() * 12) + 3));
        }
        row.push(words.substring(1));
      }
      data.push(row);
    }
    return data;
  }

  fnc5x5(): void {
    this.save_col_num = 5;
    this.save_row_num = 5;
    this.defs = this._mkdefs(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc5x5");
  }
  fnc10x20(): void {
    this.save_col_num = 10;
    this.save_row_num = 20;
    this.defs = this._mkdefs(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc10x20");
  }
  fnc20x20(): void {
    this.save_col_num = 20;
    this.save_row_num = 20;
    this.defs = this._mkdefs(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc20x20");
  }
  fnc100x20(): void {
    this.save_col_num = 100;
    this.save_row_num = 20;
    this.defs = this._mkdefs(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc100x20");
  }
  fnc20x100(): void {
    this.save_col_num = 20;
    this.save_row_num = 100;
    this.defs = this._mkdefs(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc20x100");
  }
  fnc100x100(): void {
    this.save_col_num = 100;
    this.save_row_num = 100;
    this.defs = this._mkdefs(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc100x100");
  }
  update(): void {
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("update");
  }
  setCustom(): void {
    this.custom = {
      headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
      headerBackground: "linear-gradient(#829ebc,#225588)"
    }
    console.log("setCustom");
  }
}
