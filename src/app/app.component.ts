import { Component, Output, ViewChild } from '@angular/core';
import {
  TYM_CUSTOM, TYM_FUNCS, TYM_DDDEF, TYM_COL, TYM_ORDER, TymTableComponent
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

  private drag_row_num: number = -1;
  @ViewChild("tymTable")
  private tymTable?: TymTableComponent;
  /////////////////////////////////////////////////////////////////////
  dragType: string = 'none';
  dropType: string = 'none';
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
  @Output() dddef: TYM_DDDEF = {
    dragType: this.dragType as any,
    dropType: this.dropType as any,
    doDragStart: (event: DragEvent, num: number, row: any) => {
      this.drag_row_num = num;
      (event.currentTarget as HTMLElement).style.opacity = '.2';
      event.dataTransfer!.dropEffect = this.dddef.dragType as any;
      const nums = this.tymTable!.getSelections();
      let rows = [];
      for (let index = 0; index < nums.length; index++) {
        const element = nums[index];
        rows.push(this.data[element]);
      }
      event.dataTransfer?.setData('text/plain', nums.toString());
      event.dataTransfer?.setData('application/json', JSON.stringify(rows));
    },
    doDragEnd: (event: DragEvent, num: number, row: any) => {
      (event.currentTarget as HTMLElement).style.opacity = '';
      console.log(event,num);
    },
    doDragEnter: (event: DragEvent, num: number, row: any) => {
      console.log(event,num);
      if (this.drag_row_num == num) {
        event.dataTransfer!.dropEffect = 'none';
        return;
      }
      event.preventDefault();
      event.dataTransfer!.dropEffect = this.dddef.dropType as any;
    },
    doDragOver: (event: DragEvent, num: number, row: any) => {
      event.preventDefault();
      if (this.drag_row_num == num) {
        event.dataTransfer!.dropEffect = 'none';
        return;
      }
      event.dataTransfer!.dropEffect = 'copy';
    },
    doDrop: (event: DragEvent, num: number, row: any) => {
      console.log(event,num);
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
    }
    this.custom = custom;
    let dddef: TYM_DDDEF = {
      dragType: this.dragType as any,
      dropType: this.dropType as any,
      doDragStart: this.dddef.doDragStart,
      doDragEnd: this.dddef.doDragEnd,
      doDragEnter: this.dddef.doDragEnter,
      doDragOver: this.dddef.doDragOver,
      doDrop: this.dddef.doDrop
    }
    this.dddef = dddef;
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

  @Output() resizeCallback(thisElm: HTMLElement, parentElm: HTMLElement) {
    parentElm.style.border = "solid 1px red";
    parentElm.style.width = thisElm.clientWidth * 1.5 + "px";
    parentElm.style.height = thisElm.clientHeight * 1.5 + "px";
  }
}
