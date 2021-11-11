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
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  TYM_CUSTOM,
  TYM_FUNCS,
  TYM_DDDEF,
  // DRAG_TYPE,
  // DROP_TYPE,
  TYM_COL,
  TYM_ORDER
} from './tym-table.interface'
import { TymTableUtilities } from "./tym-table.utilities";

@Component({
  selector: 'ngx-tym-table',
  templateUrl: './tym-table.component.html',
  styleUrls: ['./tym-table.component.scss']
})

/**
 * 簡易なテーブルコンポーネント
 * 
 */
export class TymTableComponent implements AfterViewInit {

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
      this.fontFamily = custom.fontFamily ?? '';
      this.fontSize = custom.fontSize ?? '';
      this.borderColor = custom.borderColor ?? '';
      this.headerBackground = custom.headerBackground ?? '';
      this.headerColor = custom.headerColor ?? '';
      this.headerBoxShadow = custom.headerBoxShadow ?? '';
      this.bodyColor = custom.bodyColor ?? '';
      this.bodyBoxShadow = custom.bodyBoxShadow ?? '';
      this.bodyBoxPadding = custom.bodyBoxPadding ?? '';
      this.bodyEvenColor = custom.bodyEvenColor ?? '';
      this.bodyOddColor = custom.bodyOddColor ?? '';
      this.bodySeldColor = custom.bodySeldColor ?? '';
      this.bodyHovrColor = custom.bodyHovrColor ?? '';
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
    event.dataTransfer?.setData('text/plain', num.toString());
    event.dataTransfer?.setData('application/json', JSON.stringify(row));
    event.dataTransfer!.effectAllowed = this._dd_def.dragType as any;
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
   * ドロップターゲットに入った時 および ドロップターゲット上にある時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDragEnterOrOver = (event: DragEvent, num: number, row: any): void => {
    event.preventDefault();
    if (this._dd_def.dropType != event.dataTransfer?.effectAllowed) {
      if (event.dataTransfer?.effectAllowed == 'copyMove') {
        event.dataTransfer!.dropEffect = this._dd_def.dropType as any;
      } else {
        event.dataTransfer!.dropEffect = 'none';
      }
    } else {
      event.dataTransfer!.dropEffect = this._dd_def.dropType as any;
    }
  }

  /**
   * ドロップターゲットに入った時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDragEnter = this._doDragEnterOrOver;

  /**
   * ドロップターゲットの上にある時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDragOver = this._doDragEnterOrOver;

  /**
   * ドロップターゲットにドロップされた時に実行する
   * @param event ドラッグイベント
   * @param num 行番号
   * @param row 行データ
   */
  private _doDrop = (event: DragEvent, num: number, row: any): void => {
  }

  /**
   * DragDropDirectiveクラス用共有データ
   */
  private _dd_com_data = {}

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
    this._dd_def = {
      dragType: dddef.dragType ?? 'none',
      dropType: dddef.dropType ?? 'none',
      doDragStart: this._doDragStart,
      doDragEnd: this._doDragEnd,
      doDragEnter: this._doDragEnter,
      doDragOver: this._doDragOver,
      doDrop: this._doDrop,
      _getRow: (row) => this._getRow(this._data, row),
      _getComData: () => this._dd_com_data
    }
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

  @Input() chkbox: boolean = true;
  @Input() lastsp: boolean = true;
  @Input() autors: boolean = false;

  //-------------------------------------------------------------------
  private thisElm: HTMLElement;
  /**
   * コンストラクター
   */
  constructor(
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) {
      this.thisElm = this.elementRef.nativeElement as HTMLElement;
    }

  //-------------------------------------------------------------------

  /**
   * ビューを初期化した後の処理
   */
  ngAfterViewInit() {
    if (this.autors) {
      setTimeout(() => {
        TymTableUtilities._allWiden(this.thisElm.firstElementChild as HTMLTableElement);
      });
    }
  }

  //-------------------------------------------------------------------

  /**
   * テーブル全行チェックボックスクリック用関数
   * @param event イベント
   */
  onAllCheckChange(event: any) {
    this._allCheck = event;
    this._rows_chkd.forEach((val, idx) => this._rows_chkd[idx] = event);
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
    this.setSelection([row]);
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
    // this.changeDetectorRef.detectChanges();
  }

  /** 
   * 再描画する関数
   * 
   *  cols, data が描画用に再取得され表示される
   */
  drowData() {
    this._drowHead();
    this._drowData();
    // this.changeDetectorRef.detectChanges();
  }

  /**
   * 選択行を返却する関数
   * 
   *  選択された状態になっている行番号(複数)を返却する。
   * 
   * @returns rownums: number[]
   */
  getSelection(): number[] {
    let ret: number[] = [];
    for (let index = 0; index < this._rows_chkd.length; index++) {
      if (this._rows_chkd[index]) {
        ret.push(index);

      }
    }
    return ret;
  }

  /**
   * 選択行をすべてクリアする
   */
  clearSelection(): void {
    this._allCheck = false;
    this._rows_chkd.forEach((val, idx) => this._rows_chkd[idx] = false);
  }

  /**
   * 指定した行を選択状態にする
   * 
   * @param rownums 選択状態に行番号の配列
   */
  setSelection(rownums: number[]): void {
    rownums.forEach((val) => this._rows_chkd[val] = true);
    if (this._rows_chkd.every(checked => checked == true)) {
      this._allCheck = true;
    } else {
      this._allCheck = false;
    }
  }

  //-------------------------------------------------------------------
  // inner

  /**
   * 表示データの作成 (head)
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

  /**
   * 表示データの作成 (body)
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
    if (this.autors) {
      setTimeout(() => {
        TymTableUtilities._allWiden(this.thisElm.firstElementChild as HTMLTableElement);
      });
    }
  }

  /**
   * 表示データの作成 (body)
   * @private @access private
   */
  _ddDrow() {
    let rows_data: string[][] = [];
    this._rows_chkd = this._rows_chkd.slice();
    this._rows_data.forEach(vals => rows_data.push(vals.slice()));
    this._rows_data = rows_data;
    // this.changeDetectorRef.detectChanges();
  }
}