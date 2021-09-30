/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, Input, Output, ElementRef, Renderer2, OnInit ,EventEmitter} from '@angular/core';
import { TYM_DDDEF } from "./tym-table.interface";

/**
 * テーブルごとの共有データ
 */
interface TYM_DDCOM {
  drag_type: string;
  wk_tr_elm: HTMLTableRowElement | null;
  tbody_elm: HTMLTableSectionElement | null;
  dragging_elm: HTMLTableRowElement | null;
  wk_tr_destory: Function;
}

@Directive({
  selector: '[dragdrop]'
})
export class DragDropDirective implements OnInit {

  /**
   * 他のテーブルからのドロップ後のイベント用
   */
  private static listener: Set<Function> = new Set();

  /**
   * DragDropDirectiveのパラメタ
   *   checkbox: {true, false}
   *   row_num : row number
   *   dddef   : TYM_DDDEF
   */
  private _drag_elm: boolean = false;
  private _this_row: number = -1;
  private _dd_def: TYM_DDDEF = {};

  /**
   * テーブルごとの共有データ
   */
  private _dd_com!: TYM_DDCOM;

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {string} 操作の種類 {none,copy,link,move}
   * @memberof DragDropDirective
   */
  @Input() set dragdrop(dragdrop: any[]) {
    [this._drag_elm, this._this_row, this._dd_def] = dragdrop;
    this._setDragElement(this.elementRef.nativeElement);
    this._setDropElement(this.elementRef.nativeElement);
  }

  /**
   * 親コンポーネントへ再描画を依頼する
   */
  @Output() ddDrowEvent = new EventEmitter();

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @param {Renderer2} render DOMを操作用
   * @memberof DragDropDirective
   */
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  /**
   * 初期処理
   *
   * @memberof DragDropDirective
   */
  public ngOnInit() {
    const trElm = this.elementRef.nativeElement as HTMLTableRowElement;
    this._setDragElement(trElm);
    this._setDropElement(trElm);
    if (!this._dd_def._getComData) {
      return;
    }
    const tbodyElm = trElm.closest('tbody') as HTMLTableSectionElement;
    const tableElm = trElm.closest('table') as HTMLTableElement;
    const theadTrElm = tableElm.querySelector('thead tr') as HTMLTableRowElement;
    if (!this._dd_com) {
      this._dd_com = this._dd_def._getComData();
      this._dd_com.tbody_elm = tbodyElm;
      this._dd_com.drag_type = this._dd_def.dragType as any ?? 'none';
    }
    if (!this._dd_com.wk_tr_elm) {
      this._dd_com.wk_tr_elm = this.renderer.createElement('tr') as HTMLTableRowElement;
      let tdElm = this.renderer.createElement('td') as HTMLTableCellElement;
      tdElm.colSpan = theadTrElm.childElementCount;
      this._dd_com.wk_tr_elm.appendChild(tdElm);
      this._dd_com.wk_tr_elm.classList.add('working');
      this._dd_com.wk_tr_elm.addEventListener('dragenter', this._dragEnter);
      this._dd_com.wk_tr_elm.addEventListener('dragover', this._dragOver);
      this._dd_com.wk_tr_elm.addEventListener('drop', this._drop);
      this._dd_com.wk_tr_destory = () => {
        const _wk_elm = this._dd_com.wk_tr_elm;
        _wk_elm?.parentElement?.removeChild(_wk_elm);
        this.ddDrowEvent.emit();
      }
    }
  }

  /**
   * ドラッグ用のイベント等設定
   * @param thisElm HTMLElement
   */
  private _setDragElement = (thisElm: HTMLElement): void => {
    const draggable = TYMDRAG_DEF.indexOf(this._dd_def.dragType ?? 'none') >= 1;
    thisElm.draggable = this._drag_elm && draggable;
    if (thisElm.draggable) {
      thisElm.addEventListener('dragstart', this._dragStart);
      thisElm.addEventListener('dragend', this._dragEnd);
      thisElm.classList.add('clickable');
    } else {
      thisElm.classList.remove('clickable');
      thisElm.removeEventListener('dragend', this._dragEnd);
      thisElm.removeEventListener('dragstart', this._dragStart);
    }
  }

  /**
   * ドロップ用のイベント等設定
   * @param thisElm HTMLElement
   */
  private _setDropElement = (thisElm: HTMLElement): void => {
    const droptarget = TYMDROP_DEF.indexOf(this._dd_def.dropType ?? 'none') >= 1;
    if (droptarget) {
      thisElm.addEventListener('dragenter', this._dragEnter);
      thisElm.addEventListener('dragover', this._dragOver);
      thisElm.addEventListener('drop', this._drop);
    } else {
      thisElm.removeEventListener('drop', this._drop);
      thisElm.removeEventListener('dragover', this._dragOver);
      thisElm.removeEventListener('dragenter', this._dragEnter);
    }
  }

  /**
   * ドラッグ開始時の関数
   * @param event DragEvent
   */
  private _dragStart = (event: DragEvent): void => {
    this._dd_com.dragging_elm = this.elementRef.nativeElement;
    this._dd_com.dragging_elm?.classList.add('dragging');
    const rowdata = this._dd_def._getRow!(this._this_row);
    this._dd_def.doDragStart!(event, this._this_row, rowdata);
    this._dd_com.drag_type = event.dataTransfer?.effectAllowed as any ?? 'none';
  }

  /**
   * ドラッグ終了時の関数を定義
   * @param event DragEvent
   */
  private _dragEnd = (event: DragEvent): void => {
    const _wk_elm = this._dd_com.wk_tr_elm;
    const rowdata = this._dd_def._getRow!(this._this_row);
    this._dd_def.doDragEnd!(event, this._this_row, rowdata);
    _wk_elm?.parentElement?.removeChild(_wk_elm);
    this._dd_com.dragging_elm?.classList.remove('dragging');
    this._dd_com.dragging_elm = null;
    DragDropDirective.listener.forEach((v) => v());
    DragDropDirective.listener.clear();
    this.ddDrowEvent.emit();
  }

  /**
   * ドロップターゲットに入った時の関数
   * @param event DragEvent
   */
  private _dragEnter = (event: DragEvent): void => {
    const tbodyElm = this._dd_com.tbody_elm;
    const [rowIndex, trElm] = this._getRowIndex(event.target as HTMLElement);
    if (trElm == null || tbodyElm == null) return;
    const rowdata = this._dd_def._getRow!(rowIndex);
    this._dd_def.doDragEnter!(event, rowIndex, rowdata);

    switch (event.dataTransfer!.dropEffect) {
      case 'move':
        // 他のtable(等)からの移動
        if (this._dd_com.dragging_elm == null) {
          if (this._dd_com.wk_tr_elm?.isConnected) {
            if (rowIndex < this._dd_com.wk_tr_elm?.rowIndex!) {
              tbodyElm.insertBefore(this._dd_com.wk_tr_elm!, trElm);
            } else {
              tbodyElm.insertBefore(this._dd_com.wk_tr_elm!, trElm.nextElementSibling);
            }
          } else {
            tbodyElm.insertBefore(this._dd_com.wk_tr_elm!, trElm);
          }
          if (!DragDropDirective.listener.has(this._dd_com.wk_tr_destory)) {
            DragDropDirective.listener.add(this._dd_com.wk_tr_destory);
          }
        }
        // 自のtable(等)から移動
        else {
          if (rowIndex < this._dd_com.dragging_elm.rowIndex) {
            tbodyElm.insertBefore(this._dd_com.dragging_elm, trElm);
          } else {
            tbodyElm.insertBefore(this._dd_com.dragging_elm, trElm.nextElementSibling);
          }
        }

        break;

      case 'copy':
        if (this._dd_com.wk_tr_elm?.isConnected) {
          if (rowIndex < this._dd_com.wk_tr_elm?.rowIndex!) {
            tbodyElm.insertBefore(this._dd_com.wk_tr_elm!, trElm);
          } else {
            tbodyElm.insertBefore(this._dd_com.wk_tr_elm!, trElm.nextElementSibling);
          }
        } else {
          tbodyElm.insertBefore(this._dd_com.wk_tr_elm!, trElm);
        }
        if (!DragDropDirective.listener.has(this._dd_com.wk_tr_destory)) {
          DragDropDirective.listener.add(this._dd_com.wk_tr_destory);
        }

        break;

      default:
        break;
    }
  }

  /**
   * ロップターゲットの上にある時の関数
   * @param event DragEvent
   */
  private _dragOver = (event: DragEvent): void => {
    const [rowIndex, trElm] = this._getRowIndex(event.target as HTMLElement);
    const rowdata = this._dd_def._getRow!(rowIndex);
    this._dd_def.doDragOver!(event, rowIndex, rowdata);
  }

  /**
   * ドロップターゲットにドロップされた時の関数
   * @param event DragEvent
   */
  private _drop = (event: DragEvent): void => {
    const [rowIndex, trElm] = this._getRowIndex(event.target as HTMLElement);
    const rowdata = this._dd_def._getRow!(rowIndex);
    this._dd_def.doDrop!(event, rowIndex, rowdata);
  }

  /**
   * native rowIndexを取得する
   * @param elm 
   * @returns [rowIndex, tr element]
   */
  private _getRowIndex(elm: HTMLElement): [number, HTMLTableRowElement] {
    let trElm = elm.closest('tr') as HTMLTableRowElement;
    return [trElm!.rowIndex - 1, trElm!];
  }
}
const TYMDRAG_DEF: string[] = ['none', 'copy', 'copyMove', 'move'];
const TYMDROP_DEF: string[] = ['none', 'copy', 'move'];