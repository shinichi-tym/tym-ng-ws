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
  ChangeDetectorRef,
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

  //-------------------------------------------------------------------

  /** Host Binding style */
  @HostBinding("style.--fo-fa") fontFamily!: string;
  @HostBinding("style.--fo-sz") fontSize!: string;
  @HostBinding("style.--bo-co") borderColor!: string;
  @HostBinding("style.--hd-bg") headerBackground!: string;
  @HostBinding("style.--hd-co") headerColor!: string;
  @HostBinding("style.--hd-sa") headerBoxShadow!: string;
  @HostBinding("style.--bd-co") bodyColor!: string;
  @HostBinding("style.--bd-sa") bodyBoxShadow!: string;
  @HostBinding("style.--ev-co") bodyEvenColor!: string;
  @HostBinding("style.--od-co") bodyOddColor!: string;
  @HostBinding("style.--se-co") bodySeldColor!: string;
  @HostBinding("style.--ho-co") bodyHovrColor!: string;

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {CUSTOM}
   * @memberof TymTableComponent
   */
  @Input() set custom(custom: CUSTOM) {
    console.log("set custom:", custom);
    if (custom) {
      this.fontFamily = custom.fontFamily || "";
      this.fontSize = custom.fontSize || "";
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

  //-------------------------------------------------------------------

  /**
   * テーブルデータから行数を取得する
   * @param data テーブルデータ
   * @returns 行数
   */
  private _getRowSize = (data: any) => { return (data as any[]).length; }

  /**
   * テーブルデータから行データを取得する
   * @param data テーブルデータ
   * @param num 行番号
   * @returns 行データ
   */
  private _getRow = (data: any, num: number) => { return (data as any[])[num]; }

  /**
   * 行データからカラムデータを取得する
   * @param row 行データ
   * @param num カラム番号
   * @returns カラムデータ
   */
  private _getVal = (row: any, num: number) => { return (row as any[])[num] as string; }

  /**
   * ソート対象ヘッダークリック時に実行する
   * @param row 行データ
   * @param num カラム番号
   * @returns カラムデータ
   */
  private _doOrder = (order: string, col: number) => {
    this.odrmk = { column: col, order: (order == 'asc') ? 'desc' : 'asc' } as ORDER_MARK
  }

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {ACCESS_FUNCTIONS}
   * @memberof TymTableComponent
   */
  @Input() set afnc(afnc: ACCESS_FUNCTIONS) {
    console.log("set afnc:", afnc);
    if (afnc?.getRowSize) {
      this._getRowSize = afnc.getRowSize;
    }
    if (afnc?.getRow) {
      this._getRow = afnc.getRow;
    }
    if (afnc?.getVal) {
      this._getVal = afnc.getVal;
    }
    if (afnc?.doOrder) {
      this._doOrder = afnc.doOrder;
    }
  }

  //-------------------------------------------------------------------

  /**
   * テーブルのカラム定義の指定値
   */
  private _cols: COL[] = [];

  /**
   * カラムデータの変更確認用
   */
  private col_defs: string = '';

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {COL[]}
   * @memberof TymTableComponent
   */
  @Input() set cols(cols: COL[]) {
    console.log("set cols:", cols);
    if (cols) {
      this._cols = cols;
    } else {
      this._cols = [];
    }
    this._drowHead();
  }

  //-------------------------------------------------------------------

  /** 
   * テーブル表示データの指定値
   */
  private _data: any[] = [];

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {any[][]}
   * @memberof TymTableComponent
   */
  @Input() set data(data: any[]) {
    this._data = data;
    console.log("set data:");
    this.allCheck = false;
    this._drowData();
  }

  //-------------------------------------------------------------------

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {ORDER_MARK}
   * @memberof TymTableComponent
   */
  @Input() set odrmk(odrmk: ORDER_MARK) {
    console.log("set odrmk:", odrmk);
    this.head_odrs = new Array(this.head_data.length);
    if (odrmk) {
      if (odrmk.column < this.head_odrs.length) {
        this.head_odrs[odrmk.column] = odrmk.order;
      }
    }
  }

  /**
   * テーブルヘッダー行表示用の定義(templae内で利用)
   */
  head_data: COL[] = [];

  /**
   * テーブル表示用のデータ(templae内で利用)
   */
  rows_data: string[][] = [];

  /**
   * テーブル各列ソートマーク用('asc','desc',empty)(templae内で利用)
   */
  head_odrs: string[] = [];

  /**
   * テーブル全行チェック用のフラグ(templae内で利用)(ngModelで指定)
   */
  allCheck: boolean = false;

  /**
   * テーブル各行チェック用のフラグ(templae内で利用)(ngModelで指定)
   */
  rows_chkd: boolean[] = [];

  //-------------------------------------------------------------------

  /**
   * コンストラクター
   */
  constructor(
    public changeDetectorRef: ChangeDetectorRef) { }

  //-------------------------------------------------------------------

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

  //-------------------------------------------------------------------

  /**
   * テーブル全行チェックボックスクリック用関数
   * @param event イベント
   */
  onAllCheckChange(event: any) {
    this.allCheck = event;
    for (let index = 0; index < this.rows_chkd.length; index++) {
      this.rows_chkd[index] = event;
    }
  }

  /**
   * テーブル各行チェックボックスクリック用関数
   * @param event イベント
   * @param row 行
   */
  onCheckChange(event: any, row: number) {
    this.rows_chkd[row] = event;
    if (this.rows_chkd.every(checked => checked == true)) {
      this.allCheck = true;
    } else {
      this.allCheck = false;
    }
  }

  //-------------------------------------------------------------------

  /** 
   * 再描画する関数
   * 
   *  cols, data が描画用に再取得され表示される
   */
  drowHead() {
    console.log("drowHead");
    this._drowHead();
    this.changeDetectorRef.detectChanges();
  }

  /** 
   * 再描画する関数
   * 
   *  cols, data が描画用に再取得され表示される
   */
  drowData() {
    console.log("drowData");
    this._drowHead();
    this._drowData();
    this.changeDetectorRef.detectChanges();
  }

  dragstart(ev: DragEvent, row: number) {
    ev.dataTransfer?.setData(
      "application/json", JSON.stringify(this._getRow(this._data, row)));
    ev.dataTransfer?.setData("text/plain", row.toString());
    console.log(ev, row);
  }

  doOrder(col: number) {
    console.log("doOrder", col)
    if (this.head_data[col].sortable) {
      this._doOrder(this.head_odrs[col], col);
    }
  }

  //-------------------------------------------------------------------
  // inner

  /**
   * 表示データの作成
   * @param data 
   */
  private _drowData() {
    let rows_data = [];
    let rows_chkd = [];
    let colnum = this._cols.length;
    let rownum = 0;
    if (this._data) {
      rownum = this._getRowSize(this._data);
    }
    for (let row_c = 0; row_c < rownum; row_c++) {
      let row_data: string[] = [];
      let row = this._getRow(this._data, row_c);
      for (let col_c = 0; col_c < colnum; col_c++) {
        row_data.push(this._getVal(row, col_c));
      }
      rows_data.push(row_data);
      rows_chkd.push(false);
    }
    this.rows_data = rows_data;
    this.rows_chkd = rows_chkd;
  }

  /**
   * 表示データの作成
   * @param data 
   */
  private _drowHead() {
    const col_defs = JSON.stringify(this._cols);
    if (col_defs != this.col_defs) {
      this.head_data = [];
      this.col_defs = col_defs;
      this.head_data = Array.from(this._cols);
      this.head_odrs = new Array(this.head_data.length);
    }
  }
}

//---------------------------------------------------------------------
// defs

/**
 * ターブルカスタマイズの定義
 */
export interface CUSTOM {
  fontFamily?: string;        // --fo-fa: Consolas, monaco, monospace
  fontSize?: string;          // --fo-sz: 1rem
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

/**
 * データアクセス関数の定義
 */
export interface ACCESS_FUNCTIONS {
  /** data から表示行数を取得するための関数を定義, 規定値: data.length */
  getRowSize?: (data: any) => number;
  /** data から行データを取得するための関数を定義, 規定値: data[] */
  getRow?: (data: any, num: number) => any;
  /** 行データから列データを取得するための関数を定義, 規定値: row[] */
  getVal?: (row: any, num: number) => string;
  /** ソート対象ヘッダークリック時の関数を定義 */
  doOrder?: (order: string, col: number) => void;
}

/**
 * テーブルカラムの定義
 */
export interface COL {
  /** タイトル */
  title: string;
  /** 桁幅, 例:8em, 規定値:なし */
  width?: string;
  /** 揃え, 例:right, 規定値:なし(left) */
  align?: string;
  /** ソート対象, 規定値:なし(false) */
  sortable?: boolean;
}

/**
 * ソートマークの定義
 */
export interface ORDER_MARK {
  /** ソートマーク位置 */
  column: number;
  /** ソート方向, {'asc','desc',empty}, 規定値:empty */
  order: string;
}
