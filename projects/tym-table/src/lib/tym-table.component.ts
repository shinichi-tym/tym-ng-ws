/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import {
  Component,
  Input,
  Output,
  HostBinding,
  ChangeDetectorRef
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
export class TymTableComponent {

  //-------------------------------------------------------------------

  /** Host Binding style */
  @HostBinding('style.--fo-fa') protected fontFamily!: string;
  @HostBinding('style.--fo-sz') protected fontSize!: string;
  @HostBinding('style.--bo-co') protected borderColor!: string;
  @HostBinding('style.--hd-bg') protected headerBackground!: string;
  @HostBinding('style.--hd-co') protected headerColor!: string;
  @HostBinding('style.--hd-sa') protected headerBoxShadow!: string;
  @HostBinding('style.--bd-co') protected bodyColor!: string;
  @HostBinding('style.--bd-sa') protected bodyBoxShadow!: string;
  @HostBinding('style.--bd-pa') protected bodyBoxPadding!: string;
  @HostBinding('style.--ev-co') protected bodyEvenColor!: string;
  @HostBinding('style.--od-co') protected bodyOddColor!: string;
  @HostBinding('style.--se-co') protected bodySeldColor!: string;
  @HostBinding('style.--ho-co') protected bodyHovrColor!: string;

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {TYM_CUSTOM}
   * @memberof TymTableComponent
   */
  @Input() set custom(custom: TYM_CUSTOM) {
    if (custom) {
      this.fontFamily = custom.fontFamily || '';
      this.fontSize = custom.fontSize || '';
      this.borderColor = custom.borderColor || '';
      this.headerBackground = custom.headerBackground || '';
      this.headerColor = custom.headerColor || '';
      this.headerBoxShadow = custom.headerBoxShadow || '';
      this.bodyColor = custom.bodyColor || '';
      this.bodyBoxShadow = custom.bodyBoxShadow || '';
      this.bodyBoxPadding = custom.bodyBoxPadding || '';
      this.bodyEvenColor = custom.bodyEvenColor || '';
      this.bodyOddColor = custom.bodyOddColor || '';
      this.bodySeldColor = custom.bodySeldColor || '';
      this.bodyHovrColor = custom.bodyHovrColor || '';
    }
  }

  //-------------------------------------------------------------------

  /**
   * テーブルデータから行数を取得する
   * @param data テーブルデータ
   * @returns 行数
   */
  private _getRowSize = (data: any): number => {
    return (data as any[]).length;
  }

  /**
   * テーブルデータから行データを取得する
   * @param data テーブルデータ
   * @param num 行番号
   * @returns 行データ
   */
  private _getRow = (data: any, num: number): any => {
    return (data as any[])[num];
  }

  /**
   * 行データからカラムデータを取得する
   * @param row 行データ
   * @param num カラム番号
   * @returns カラムデータ
   */
  private _getVal = (row: any, num: number): string => {
    return (row as any[])[num] as string;
  }

  /**
   * ソート対象ヘッダークリック時に実行する
   * @param order 現在のorder
   * @param num カラム番号
   */
  private _doOrder = (order: string, num: number): void => {
    this.odrmk = { column: num, order: (order == 'asc') ? 'desc' : 'asc' } as TYM_ORDER
  }

  /**
   * コンテキスト開始時に実行する
   * @param event コンテキストイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doContext = (event: MouseEvent, num: number, row: any): boolean => true;

  /**
   * コンテキスト開始時に実行する
   * @param event コンテキストイベント
   * @param num1 行番号
   * @param num2 列番号
   * @param row 行データ
   */
  private _doClick = (event: MouseEvent, num1: number, num2: number, row: any): void => { };

   /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {TYM_FUNCS}
   * @memberof TymTableComponent
   */
  @Input() set afnc(afnc: TYM_FUNCS) {
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
    if (afnc?.doContext) {
      this._doContext = afnc.doContext;
    }
    if (afnc?.doClick) {
      this._doClick = afnc.doClick;
    }
  }

  //-------------------------------------------------------------------

  /**
   * テーブルのカラム定義の指定値
   */
  private _cols: TYM_COL[] | string[] = [];

  /**
   * カラムデータの変更確認用
   */
  private _col_defs: string = '';

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {TYM_COL[]}
   * @memberof TymTableComponent
   */
  @Input() set cols(cols: TYM_COL[] | string[]) {
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
    this._allCheck = false;
    this._drowData();
  }

  //-------------------------------------------------------------------

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {TYM_ORDER}
   * @memberof TymTableComponent
   */
  @Input() set odrmk(odrmk: TYM_ORDER) {
    this._head_odrs = new Array(this._head_data.length);
    if (odrmk) {
      if (odrmk.column < this._head_odrs.length) {
        this._head_odrs[odrmk.column] = odrmk.order;
      }
    }
  }

  //-------------------------------------------------------------------

  /**
   * ドラッグ開始時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDragStart = (event: DragEvent, num: number, row: any): void => {
    event.dataTransfer!.dropEffect = this._dd_def.dragType as any;
    event.dataTransfer?.setData('text/plain', num.toString());
    event.dataTransfer?.setData('application/json', JSON.stringify(row));
  }

  /**
   * ドラッグ終了時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDragEnd = (event: DragEvent, num: number, row: any): void => {
  }

  /**
   * ドロップターゲットに入った時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDragEnter = (event: DragEvent, num: number, row: any): void => {
    event.dataTransfer!.effectAllowed = 'none';
  }

  /**
   * ドロップターゲットの上にある時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDragOver = (event: DragEvent, num: number, row: any): void => {
    event.dataTransfer!.effectAllowed = 'none';
  }

  /**
   * ドロップターゲットにドロップされた時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDrop = (event: DragEvent, num: number, row: any): void => {
  }

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {TYM_DDDEF}
   * @memberof TymTableComponent
   */
  @Input() set dddef(dddef: TYM_DDDEF) {
    if (dddef?.doDragStart) {
      this._doDragStart = dddef.doDragStart;
    }
    if (dddef?.doDragEnd) {
      this._doDragEnd = dddef.doDragEnd;
    }
    if (dddef?.doDragEnter) {
      this._doDragEnter = dddef.doDragEnter;
    }
    if (dddef?.doDragOver) {
      this._doDragOver = dddef.doDragOver;
    }
    if (dddef?.doDrop) {
      this._doDrop = dddef.doDrop;
    }
    /** TYM_DDDEF */
    this._dd_def.dragType = dddef.dragType || 'none';
    this._dd_def.dropType = dddef.dropType || 'none';
    this._dd_def.doDragStart = this._doDragStart;
    this._dd_def.doDragEnd = this._doDragEnd;
    this._dd_def.doDragEnter = this._doDragEnter;
    this._dd_def.doDragOver = this._doDragOver;
    this._dd_def.doDrop = this._doDrop;
    this._dd_def._getRow = (row) => this._getRow(this._data, row);
  }

  //-------------------------------------------------------------------

  /**
   * テーブルヘッダー行表示用の定義(templae内で利用)
   * @private @access private
   */
  _head_data: TYM_COL[] = [];

  /**
   * テーブル表示用のデータ(templae内で利用)
   * @private @access private
   */
  _rows_data: string[][] = [];

  /**
   * テーブル各列ソートマーク用('asc','desc',empty)(templae内で利用)
   * @private @access private
   */
  _head_odrs: string[] = [];

  /**
   * テーブル全行チェック用のフラグ(templae内で利用)(ngModelで指定)
   * @private @access private
   */
  _allCheck: boolean = false;

  /**
   * テーブル各行チェック用のフラグ(templae内で利用)(ngModelで指定)
   * @private @access private
   */
  _rows_chkd: boolean[] = [];

  /**
   * ドラッグアンドドロップディレクティブ用の定義(templae内で利用)
   * @private @access private
   */
  @Output() _dd_def: TYM_DDDEF = {};

  //-------------------------------------------------------------------

  /**
   * コンストラクター
   */
  constructor(
    private changeDetectorRef: ChangeDetectorRef) { }

  //-------------------------------------------------------------------

  /**
   * テーブル全行チェックボックスクリック用関数
   * @param event イベント
   */
  onAllCheckChange(event: any) {
    this._allCheck = event;
    for (let index = 0; index < this._rows_chkd.length; index++) {
      this._rows_chkd[index] = event;
    }
  }

  /**
   * テーブル各行チェックボックスクリック用関数
   * @param event イベント
   * @param row 行
   */
  onCheckChange(event: any, row: number) {
    this._rows_chkd[row] = event;
    if (this._rows_chkd.every(checked => checked == true)) {
      this._allCheck = true;
    } else {
      this._allCheck = false;
    }
  }

  /**
   * ドソート対象ヘッダークリック時に実行する
   * @param col カラム番号
   */
  onOrder(col: number) {
    if (this._head_data[col].sortable) {
      this._doOrder(this._head_odrs[col], col);
      this._allCheck = false;
    }
  }

  /**
   * コンテキスト開始時に実行する
   * @param ev コンテキストイベント
   * @param row 行番号
   */
  onContext(ev: MouseEvent, row: number): boolean {
    return this._doContext(ev, row, this._getRow(this._data, row));
  }

  /**
   * コンテキスト開始時に実行する
   * @param ev コンテキストイベント
   * @param row 行番号
   * @param col 列番号
   */
  onClick(ev: MouseEvent, row: number, col: number): void {
    const coldef = this._cols[col] as TYM_COL;
    if (coldef.clickable) {
      this._doClick(ev, row, col, this._getRow(this._data, row));
    }
  }

  //-------------------------------------------------------------------

  /** 
   * 再描画する関数
   * 
   *  cols, data が描画用に再取得され表示される
   */
  drowHead() {
    this._drowHead();
    this.changeDetectorRef.detectChanges();
  }

  /** 
   * 再描画する関数
   * 
   *  cols, data が描画用に再取得され表示される
   */
  drowData() {
    this._drowHead();
    this._drowData();
    this.changeDetectorRef.detectChanges();
  }

  /**
   * 選択行を返却する関数
   * 
   *  選択された状態になっている行番号(複数)を返却する。
   * 
   * @returns rownums: number[]
   */
  getSelections(): number[] {
    let ret: number[] = [];
    for (let index = 0; index < this._rows_chkd.length; index++) {
      if (this._rows_chkd[index]) {
        ret.push(index);

      }
    }
    return ret;
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
    this._rows_data = rows_data;
    this._rows_chkd = rows_chkd;
  }

  /**
   * 表示データの作成
   * @param data 
   */
  private _drowHead() {
    const col_defs = JSON.stringify(this._cols);
    if (col_defs != this._col_defs) {
      let head_data: TYM_COL[] = [];
      this._col_defs = col_defs;
      for (let index = 0; index < this._cols.length; index++) {
        const element = this._cols[index];
        if (typeof element === 'string') {
          head_data.push({ title: element });
        } else {
          head_data.push(element);
        }
      }
      this._head_data = head_data;
      this._head_odrs = new Array(this._head_data.length);
    }
  }
}

//---------------------------------------------------------------------
// defs

/**
 * テーブルカスタマイズの定義
 */
export interface TYM_CUSTOM {
  fontFamily?: string;        // --fo-fa: Consolas, monaco, monospace
  fontSize?: string;          // --fo-sz: 1rem
  borderColor?: string;       // --bo-co: #888888
  headerBackground?: string;  // --hd-bg: #888888 linear-gradient(#888888, #666666)
  headerColor?: string;       // --hd-co: #ffffff
  headerBoxShadow?: string;   // --hd-sa: 1px 1px 3px 0 #cccccc inset
  bodyColor?: string;         // --bd-co: #000000
  bodyBoxShadow?: string;     // --bd-sa: 1px 1px 3px 0 #cccccc inset
  bodyBoxPadding?: string;    // --bd-pa: .4em
  bodyEvenColor?: string;     // --ev-co: #eeeeee
  bodyOddColor?: string;      // --od-co: #ffffff;
  bodySeldColor?: string;     // --se-co: #ffeeee;
  bodyHovrColor?: string;     // --ho-co: #eeffee;
}

/**
 * 関数の定義
 */
export interface TYM_FUNCS {
  /** data から表示行数を取得するための関数を定義, 規定値: data.length */
  getRowSize?: (data: any) => number;
  /** data から行データを取得するための関数を定義, 規定値: data[] */
  getRow?: (data: any, num: number) => any;
  /** 行データから列データを取得するための関数を定義, 規定値: row[] */
  getVal?: (row: any, num: number) => string;
  /** ソート対象ヘッダークリック時の関数を定義 */
  doOrder?: (order: string, col: number) => void;
  /** コンテキストアクションの関数を定義, 規定値: { } */
  doContext?: (event: MouseEvent, num: number, row: any) => boolean;
  /** クリックアクションの関数を定義, 規定値: { } */
  doClick?: (event: MouseEvent, num1: number, num2: number, row: any) => void;
}

/**
 * ドラッグアンドドロップの定義
 */
export interface TYM_DDDEF {
  /** ドラッグタイプ, 規定値: none */
  dragType?: DRAG_TYPE;
  /** ドラッグタイプ, 規定値: none */
  dropType?: DROP_TYPE;
  /** ドラッグ開始時の関数を定義 */
  doDragStart?: (event: DragEvent, num: number, row: any) => void;
  /** ドラッグ終了時の関数を定義, 規定値: { } */
  doDragEnd?: (event: DragEvent, num: number, row: any) => void;
  /** ドロップターゲットに入った時の関数を定義 */
  doDragEnter?: (event: DragEvent, num: number, row: any) => void;
  /** ドロップターゲットの上にある時の関数を定義 */
  doDragOver?: (event: DragEvent, num: number, row: any) => void;
  /** ドロップターゲットにドロップされた時の関数を定義, 規定値: { } */
  doDrop?: (event: DragEvent, num: number, row: any) => void;
  /** @private @access private */
  _getRow?: (num: number) => any;
}
export type DRAG_TYPE = 'none' | 'copy' | 'link' | 'move';
export type DROP_TYPE = 
  'none' | 'copy' | 'copyLink' | 'copyMove' | 'link' | 'linkMove' |
  'move' | 'all' | 'uninitialized';

/**
 * テーブルカラムの定義
 */
export interface TYM_COL {
  /** タイトル */
  title: string;
  /** 桁幅, 例:8em, 規定値:なし */
  width?: string;
  /** 揃え, 例:right, 規定値:なし(left) */
  align?: string;
  /** ソート対象, 規定値:なし(false) */
  sortable?: boolean;
  /** クリックアクション対象, 規定値:なし(false) */
  clickable?: boolean;
}

/**
 * ソートマークの定義
 */
export interface TYM_ORDER {
  /** ソートマーク位置 */
  column: number;
  /** ソート方向, {'asc','desc',empty}, 規定値:empty */
  order: string;
}