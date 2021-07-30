/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import {
  Component,
  Input,
  HostBinding,
  OnInit,
  OnChanges
} from '@angular/core';

@Component({
  selector: 'ngx-tym-table',
  templateUrl: './tym-table.component.html',
  styleUrls: ['./tym-table.component.scss']
})

/**
 * 簡易なテーブルコンポーネント
 * 
 */
export class TymTableComponent implements OnInit, OnChanges {

  /** Host Binding style */
  @HostBinding("style.--fo-fa") fontFamily: string = "";
  @HostBinding("style.--bo-co") borderColor: string = "";
  @HostBinding("style.--hd-bg") headerBackground: string = "";
  @HostBinding("style.--hd-co") headerColor: string = "";
  @HostBinding("style.--hd-sa") headerBoxShadow: string = "";
  @HostBinding("style.--bd-co") bodyColor: string = "";
  @HostBinding("style.--bd-sa") bodyBoxShadow: string = "";
  @HostBinding("style.--ev-co") bodyEvenColor: string = "";
  @HostBinding("style.--od-co") bodyOddColor: string = "";
  @HostBinding("style.--se-co") bodySeldColor: string = "";
  @HostBinding("style.--ho-co") bodyHovrColor: string = "";

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {CUSTOM}
   * @memberof TymTableComponent
   */
  @Input() set custom(custom: CUSTOM) {
    console.log("set custom:" + JSON.stringify(custom));
    if (custom) {
      this.fontFamily = custom.fontFamily || "";
      this.borderColor = custom.borderColor || "";
      this.headerBackground = custom.headerBackground || "";
      this.headerColor = custom.headerColor || "";
      this.headerBoxShadow = custom.headerBoxShadow || "";
      this.bodyColor = custom.bodyColor || "";
      this.bodyBoxShadow = custom.bodyBoxShadow || "";
      this.bodyEvenColor = custom.bodyEvenColor || "";
      this.bodyOddColor = custom.bodyOddColor || "";
      this.bodySeldColor = custom.bodySeldColor || "";
      this.bodyHovrColor = custom.bodyHovrColor || "";
    }
  }

  /**
   * テーブルデータから行数を取得する
   * @param data テーブルデータ
   * @returns 行数
   */
  private getRowSize = (data: any) => { return (data as any[]).length; }

  /**
   * テーブルデータから行データを取得する
   * @param data テーブルデータ
   * @param num 行番号
   * @returns 行データ
   */
  private getRow = (data: any, num: number) => { return (data as any[])[num]; }

  /**
   * 行データからカラムデータを取得する
   * @param row 行データ
   * @param num カラム番号
   * @returns カラムデータ
   */
  private getVal = (row: any, num: number) => { return (row as any[])[num] as string; }

  /**
   * テーブルの定義の内部データ
   */
  private _defs: DEFS = { cols: [] };

  /** カラムデータの変更確認用 */
  private col_defs: string = '';

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {DEFS}
   * @memberof TymTableComponent
   */
  @Input() set defs(defs: DEFS) {
    console.log("set defs:" + JSON.stringify(defs));
    if (defs) {
      this._defs = defs;
      if (!(this._defs.cols)) {
        this._defs.cols = [];
      }
    } else {
      this._defs = { cols: [] };
    }
    if (this._defs?.getRowSize) {
      this.getRowSize = this._defs.getRowSize;
    }
    if (this._defs?.getRow) {
      this.getRow = this._defs.getRow;
    }
    if (this._defs?.getVal) {
      this.getVal = this._defs.getVal;
    }
    const col_defs = JSON.stringify(this._defs.cols);
    if (col_defs != this.col_defs) {
      this.head_data = [];
      this.col_defs = col_defs;
      this.head_data = Array.from(this._defs.cols);
    }
  }

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {any[][]}
   * @memberof TymTableComponent
   */
  // @Input() data: any = [];
  @Input() set data(data: any[][]) {
    console.log("set data:");
    this.allCheck = false;
    // this._drowData(this.data);
    this._drowData(data);
  }

  /**
   * テーブルヘッダー行表示用の定義
   */
  public head_data: COL[] = [];

  /**
   * テーブル表示用のデータ
   */
  public rows_data: string[][] = [];

  public allCheck: boolean = false;
  public rows_chkd: boolean[] = [];

  /**
   * コンストラクター
   */
  constructor() { }

  /**
   * 最初のデータバインド時
   */
  ngOnInit(): void {
    console.log("ngOnInit");
  }

  /**
   * バインドされたデータの変更時
   */
   ngOnChanges(): void {
    console.log("ngOnChanges");
  }

  public onAllCheckChange(event: any) {
    this.allCheck = event;
    for (let index = 0; index < this.rows_chkd.length; index++) {
      this.rows_chkd[index] = event;
    }
  }
  public onCheckChange(event: any, row: number) {
    this.rows_chkd[row] = event;
    if (this.rows_chkd.every(checked => checked == true)) {
      this.allCheck = true;
    } else {
      this.allCheck = false;
    }
  }
  
  public drowData() {
    this._drowData(this.data);
  }

  private _drowData(data: any[][]) {
    let rows_data = [];
    let rows_chkd = [];
    let colnum = this._defs.cols.length;
    let rownum = 0;
    if (data) {
      rownum = this.getRowSize(data);
    }
    for (let row_c = 0; row_c < rownum; row_c++) {
      let row_data: string[] = [];
      let row = this.getRow(data, row_c);
      for (let col_c = 0; col_c < colnum; col_c++) {
        row_data.push(this.getVal(row, col_c));
      }
      rows_data.push(row_data);
      rows_chkd.push(false);
    }
    this.rows_data = rows_data;
    this.rows_chkd = rows_chkd;
  }

}

/**
 * テーブルカラムの定義
 */
interface COL {
  title: string;
  width?: string;
  align?: string;
  sortable?: boolean;
}

/**
 * テーブルの定義
 */
export interface DEFS {
  /** カラムの定義 */
  cols: COL[],
  /** data から表示行数を取得するための関数を定義, 規定値: data.length */
  getRowSize?: (data: any) => number;
  /** data から行データを取得するための関数を定義, 規定値: data[] */
  getRow?: (data: any, num: number) => any;
  /** 行データから列データを取得するための関数を定義, 規定値: row[] */
  getVal?: (row: any, num: number) => string;
}

/**
 * ターブルカスタマイズの定義
 */
export interface CUSTOM {
  fontFamily?: string;        // --fo-fa: Consolas, monaco, monospace
  borderColor?: string;       // --bo-co: #888888
  headerBackground?: string;  // --hd-bg: #888888 linear-gradient(#888888, #666666)
  headerColor?: string;       // --hd-co: #ffffff
  headerBoxShadow?: string;   // --hd-sa: 1px 1px 3px 0 #cccccc inset
  bodyColor?: string;         // --bd-co: #000000
  bodyBoxShadow?: string;     // --bd-sa: 1px 1px 3px 0 #cccccc inset
  bodyEvenColor?: string;     // --ev-co: #eeeeee
  bodyOddColor?: string;      // --od-co: ffffff;
  bodySeldColor?: string;     // --se-co: #ffeeee;
  bodyHovrColor?: string;     // --ho-co: #eeffee;
}
