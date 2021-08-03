import { Component, Output } from '@angular/core';
import { CUSTOM, ACCESS_FUNCTIONS, COL, ORDER_MARK } from 'projects/tym-table/src/public-api';

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
  @Output() afnc: ACCESS_FUNCTIONS = {};
  @Output() cols: COL[] | any = null;
  @Output() data: any[][] | any = null;
  @Output() odrmk: ORDER_MARK | any = null;

  /////////////////////////////////////////////////////////////////////
  @Output() custom1: CUSTOM = {
    fontSize: "9px",
    headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
    headerBackground: "linear-gradient(#829ebc,#225588)"
  }
  @Output() cols1: COL[] = [
    { title: "単価", width: "10em", align: "right", sortable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "12em", align: "right", sortable: true }
  ];
  @Output() data1: any[][] = [
    [980, 627, 614460],
    [1980, 1219, 2413620],
    [2980, 116, 345680]
  ];
  @Output() odrmk1: ORDER_MARK = {
    order: 'asc',
    column: 0
  };
  /////////////////////////////////////////////////////////////////////
  @Output() custom2: CUSTOM = {
    fontSize: "9px",
    headerBackground: "#444",
    headerBoxShadow: "#fff",
    bodyBoxShadow: "#fff",
    bodyColor: "000"
  }
  @Output() cols2: COL[] = [
    { title: "単価", width: "10em", align: "right", sortable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "12em", align: "right", sortable: true }
  ];
  @Output() data2: any[][] = [
    [980, 627, 614460],
    [1980, 1219, 2413620],
    [2980, 116, 345680]
  ];
  @Output() odrmk2: ORDER_MARK = {
    order: 'asc',
    column: 0
  };

  /** size 0x0 */
  fnc0x0(): void {
    this.afnc = {};
    this.cols = [];
    this.data = [];
    this.save_col_num = 0;
    this.save_row_num = 0;
    console.log("fnc0x0");
  }

  /** size 1x1 */
  fnc1x1(): void {
    this.cols = [
      { title: "単価", align: "right" }
    ] as COL[];
    this.data = [
      [980],
    ];
    this.save_col_num = 1;
    this.save_row_num = 1;
    console.log("fnc1x1");
  }

  /** size 1x1 width:100 */
  fnc1x1w100(): void {
    this.cols = [
      { title: "単価", width: "100px", align: "right" }
    ] as COL[];
    this.data = [
      [980],
    ];
    this.save_col_num = 1;
    this.save_row_num = 1;
    console.log("fnc1x1w100");
  }

  /** size 3x3 width */
  fnc3x3(): void {
    this.afnc = {
      doOrder: (order: string, col: number) => {
        this.odrmk = {
          order: (order == 'asc') ? 'desc' : 'asc',
          column: col
        }
        let f = (order == 'asc') ? -1 : 1;
        this.data = [
          [980, 627, 614460],
          [1980, 1219, 2413620],
          [2980, 116, 345680]
        ].sort(function (a, b) { return (a[col] - b[col]) * f; });
        console.log(this.data);
      }
    }
    this.cols = [
      { title: "単価", width: "10em", align: "right", sortable: true },
      { title: "販売数", width: "8em", align: "right", sortable: true },
      { title: "売上", width: "12em", align: "right", sortable: true }
    ] as COL[];
    this.data = [
      [980, 627, 614460],
      [1980, 1219, 2413620],
      [2980, 116, 345680]
    ];
    this.odrmk = {
      order: 'asc',
      column: 0
    }
    this.save_col_num = 3;
    this.save_row_num = 3;
    console.log("fnc3x3");
  }

  _mkcols(cols: number): COL[] {
    let _cols: COL[] = [];
    for (let index_c = 0; index_c < cols; index_c++) {
      let wordnum: number = Math.floor(Math.random() * 3) + 1;
      let headsize: number = Math.floor(Math.random() * 5) + 5;
      let words: string = '';
      for (let index = 0; index < wordnum; index++) {
        words += ' ' + Math.random().toString(36).replace(/[^a-z]+/g, '')
          .substr(0, (Math.floor(Math.random() * 8) + 3));
      }
      _cols.push({ title: words.substring(1), width: headsize + "rem" });
    }
    return _cols;
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
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc5x5");
  }
  fnc10x20(): void {
    this.save_col_num = 10;
    this.save_row_num = 20;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc10x20");
  }
  fnc20x20(): void {
    this.save_col_num = 20;
    this.save_row_num = 20;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc20x20");
  }
  fnc100x20(): void {
    this.save_col_num = 100;
    this.save_row_num = 20;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc100x20");
  }
  fnc20x100(): void {
    this.save_col_num = 20;
    this.save_row_num = 100;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc20x100");
  }
  fnc100x100(): void {
    this.save_col_num = 100;
    this.save_row_num = 100;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc100x100");
  }
  update(): void {
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("update");
  }
  setCustom(): void {
    let org = false;
    if (this.custom.headerBackground) {
      if (this.custom.headerBackground[0] != "#") {
        org = true;
      }
    }
    this.custom = (org)
      ? {
        headerBoxShadow: "1px 1px 3px 0 #cccccc inset",
        headerBackground: "#888888 linear-gradient(#888888, #666666)"
      }
      : {
        headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
        headerBackground: "linear-gradient(#829ebc,#225588)"
      }
    console.log("setCustom");
  }
  setFont9px(): void {
    this.custom = {
      fontSize: "9px"
    }
  }
  setFont12px(): void {
    this.custom = {
      fontSize: "12px"
    }
  }
  setFont1ram(): void {
    this.custom = {
      fontSize: "1ram"
    }
  }

  dragover(ev: any) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "copy";
  }
  DropZone: string = "Drop Zone"
  drop(ev: any) {
    ev.preventDefault();
    let rownum = ev.dataTransfer.getData("text/plain");
    let data = ev.dataTransfer.getData("application/data");
    this.DropZone = rownum + "\r\n" + data;
  }
}
