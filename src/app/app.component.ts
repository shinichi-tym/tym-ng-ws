import { Component, Output, ViewChild } from '@angular/core';
import {
  TYM_CUSTOM, TYM_FUNCS, TYM_COL, TYM_ORDER, TymTableComponent
} from "tym-table";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tym-ng-ws';
  private save_col_num: number = 4;
  private save_row_num: number = 4;

  @ViewChild("tymTable")
  private tymTable?: TymTableComponent;
  /////////////////////////////////////////////////////////////////////
  @Output() custom: TYM_CUSTOM = {}
  @Output() afnc: TYM_FUNCS = {
    doOrder: (order: string, col: number) => {
      this.odrmk = {
        order: (order == 'asc') ? 'desc' : 'asc',
        column: col
      }
      let f = (order == 'asc') ? -1 : 1;
      this.data = (this.data as number[][]).sort(function (a, b) { return (a[col] - b[col]) * f; });
      console.log(this.data);
      this.tymTable?.drowData(); // データ更新だけのため直接再描画を実行
    }
  }
  @Output() cols: TYM_COL[] | any = [
    { title: "単価", width: "10em", align: "right", sortable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "10em", align: "right", sortable: true },
    { title: "注意事項", width: "10em", align: "left", sortable: false }
  ];
  @Output() data: any[][] | any = [
    [980, 627, 614460, ],
    [1980, 1219, 2413620, ],
    [2980, 116, 345680, "※備考参照:ここには注意事項が表示されます"],
    [3980, 616, 2451680, ]
  ];
  @Output() odrmk: TYM_ORDER | any = {
    order: 'asc',
    column: 0
  };
  /////////////////////////////////////////////////////////////////////
  @Output() custom1: TYM_CUSTOM = {
    fontSize: "10px",
    headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
    headerBackground: "linear-gradient(#829ebc,#225588)"
  }
  @Output() cols1: TYM_COL[] = [
    { title: "単価", width: "10em", align: "right", sortable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "12em", align: "right", sortable: true }
  ];
  @Output() data1: any[][] = [
    [980, 627, 614460],
    [1980, 1219, 2413620],
    [2980, 116, 345680]
  ];
  @Output() odrmk1: TYM_ORDER = {
    order: 'asc',
    column: 0
  };
  /////////////////////////////////////////////////////////////////////
  @Output() custom2: TYM_CUSTOM = {
    fontSize: "10px",
    headerBackground: "#444",
    headerBoxShadow: "#fff",
    bodyBoxShadow: "#fff",
    bodyColor: "000"
  }
  @Output() cols2: TYM_COL[] = [
    { title: "単価", width: "10em", align: "right", sortable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "12em", align: "right", sortable: true }
  ];
  @Output() data2: any[][] = [
    [980, 627, 614460],
    [1980, 1219, 2413620],
    [2980, 116, 345680]
  ];
  @Output() odrmk2: TYM_ORDER = {
    order: 'asc',
    column: 0
  };

  /** size 0x0 */
  fnc0x0(): void {
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
    ] as TYM_COL[];
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
    ] as TYM_COL[];
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
        this.data = (this.data as number[][]).sort(function (a, b) { return (a[col] - b[col]) * f; });
        console.log(this.data);
        this.tymTable?.drowData(); // データ更新だけのため直接再描画を実行
      }
    }
    this.cols = [
      { title: "単価", width: "10em", align: "right", sortable: true },
      { title: "販売数", width: "8em", align: "right", sortable: true },
      { title: "売上", width: "12em", align: "right", sortable: true }
    ] as TYM_COL[];
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

  _mkcols(cols: number): TYM_COL[] {
    let _cols: TYM_COL[] = [];
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
    this.cols = ["col1", "col2", "col3", "col4", "col5"];
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
  sample(): void {
    let org = false;
    if (this.custom.headerBackground) {
      if (this.custom.headerBackground[0] != "#") {
        org = true;
      }
    }
    this.custom = (org)
      ? {
        fontSize: "1rem", bodyBoxPadding: ".4rem",
        headerBoxShadow: "1px 1px 3px 0 #cccccc inset",
        headerBackground: "#888888 linear-gradient(#888888, #666666)"
      }
      : {
        fontSize: "14px", bodyBoxPadding: ".2rem",
        headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
        headerBackground: "linear-gradient(#829ebc,#225588)"
      }
  }
  setCustom(): void {
    let inputs = document.getElementsByTagName('input');
    let custom: TYM_CUSTOM = {};
    for (let index = 0; index < inputs.length; index++) {
      const element = inputs[index];
      const elm_val = element.value;
      const elm_id = element.parentElement?.previousSibling?.firstChild?.nodeValue;
      switch (elm_id) {
        case 'fontFamily':
          custom.fontFamily = elm_val;
          break;

        case 'fontSize':
          custom.fontSize = elm_val;
          break;

        case 'borderColor':
          custom.borderColor = elm_val;
          break;

        case 'headerBackground':
          custom.headerBackground = elm_val;
          break;

        case 'headerColor':
          custom.headerColor = elm_val;
          break;

        case 'headerBoxShadow':
          custom.headerBoxShadow = elm_val;
          break;

        case 'bodyColor':
          custom.bodyColor = elm_val;
          break;

        case 'bodyBoxShadow':
          custom.bodyBoxShadow = elm_val;
          break;

        case 'bodyBoxPadding':
          custom.bodyBoxPadding = elm_val;
          break;

        case 'bodyEvenColor':
          custom.bodyEvenColor = elm_val;
          break;

        case 'bodyOddColor':
          custom.bodyOddColor = elm_val;
          break;

        case 'bodySeldColor':
          custom.bodySeldColor = elm_val;
          break;

        case 'bodyHovrColor':
          custom.bodyHovrColor = elm_val;
          break;

        default:
          break;
      }
      this.custom = custom;
    }
    console.log("setCustom");
  }

  dragover(ev: any) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "copy";
  }
  DropZone: string = "Drop Zone"
  drop(ev: DragEvent) {
    ev.preventDefault();
    let rownum = ev.dataTransfer?.getData("text/plain");
    let data = ev.dataTransfer?.getData("application/json");
    this.DropZone = rownum + "\r\n" + data;
  }
}
