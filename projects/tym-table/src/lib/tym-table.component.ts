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

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {CUSTOM}
   * @memberof TymTableComponent
   */
  @Input() custom: CUSTOM = {};

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {DEFS}
   * @memberof TymTableComponent
   */
  @Input() defs: DEFS = { cols: [] };

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {any[][]}
   * @memberof TymTableComponent
   */
  @Input() data: any = [];

  /** カラムデータの変更確認用 */
  private col_defs: string = '';

  /**
   * テーブルヘッダー行表示用の定義
   */
  public head_data: COL[] = [];

  /**
   * テーブル表示用のデータ
   */
  public rows_data: string[][] = [];

  /**
   * テーブルデータから行数を取得する
   * @param data テーブルデータ
   * @returns 行数
   */
  private getRowSize = (data: any) => {return (data as any[]).length;}

  /**
   * テーブルデータから行データを取得する
   * @param data テーブルデータ
   * @param num 行番号
   * @returns 行データ
   */
  private getRow = (data: any, num: number) => {return (data as any[])[num];}

  /**
   * 行データからカラムデータを取得する
   * @param row 行データ
   * @param num カラム番号
   * @returns カラムデータ
   */
  private getVal = (row: any, num: number) => {return (row as any[])[num] as string;}

  /**
   * コンストラクター
   */
  constructor() { }

  @HostBinding("style.--fo-fa") fontFamily: string = "";
  @HostBinding("style.--bo-co") borderColor: string = "";
  @HostBinding("style.--hd-bg") headerBackground: string = "";
  @HostBinding("style.--hd-co") headerColor: string = "";
  @HostBinding("style.--hd-sa") headerBoxShadow: string = "";
  @HostBinding("style.--bd-co") bodyColor: string = "";
  @HostBinding("style.--bd-sa") bodyBoxShadow: string = "";
  @HostBinding("style.--ev-co") bodyEvenColor: string = "";
  @HostBinding("style.--od-co") bodyOddColor: string = "";

  /**
   * 初期設定
   */
  ngOnInit(): void {
    console.log("ngOnInit");
    console.log("CUSTOM:" + JSON.stringify(this.custom));
    this.setCustom();
    this.doDrow();
  }

  ngOnChanges(): void {
    console.log("ngOnChanges");
    this.doDrow();
  }

  private setCustom() {
    if (this.custom) {
      this.fontFamily = this.custom.fontFamily || "";
      this.borderColor = this.custom.borderColor || "";
      this.headerBackground = this.custom.headerBackground || "";
      this.headerColor = this.custom.headerColor || "";
      this.headerBoxShadow = this.custom.headerBoxShadow || "";
      this.bodyColor = this.custom.bodyColor || "";
      this.bodyBoxShadow = this.custom.bodyBoxShadow || "";
      this.bodyEvenColor = this.custom.bodyEvenColor || "";
      this.bodyOddColor = this.custom.bodyOddColor || "";
    }
    if (this.defs?.getRowSize) {
      this.getRowSize = this.defs.getRowSize;
    }
    if (this.defs?.getRow) {
      this.getRow = this.defs.getRow;
    }
    if (this.defs?.getVal) {
      this.getVal = this.defs.getVal;
    }
  }

  private doDrow() {
    this.rows_data = [];
    let colnum = 0;
    let rownum = 0;

    if (this.defs) {
      if (this.defs.cols) {
        colnum = this.defs.cols.length;
      }
    }
    if (this.data) {
      rownum = this.getRowSize(this.data);
    }
    const col_defs = JSON.stringify(this.defs?.cols);
    if (col_defs == undefined) {
      this.head_data = [];
      this.col_defs = '';
    }
    if (col_defs != undefined && col_defs != this.col_defs) {
      this.head_data = [];
      this.col_defs = col_defs;
      this.head_data = Array.from(this.defs.cols);
    }
    for (let row_c = 0; row_c < rownum; row_c++) {
      let row_data: string[] = [];
      let row = this.getRow(this.data, row_c);
      for (let col_c = 0; col_c < colnum; col_c++) {
        row_data.push(this.getVal(row, col_c));
      }
      this.rows_data.push(row_data);
    }
  }

}

/**
 * テーブルカラムの定義
 */
interface COL {
  title: string;
  width?: string;
  align?: string;
  sortable?: Boolean;
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
}
