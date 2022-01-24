/*!
 * tym-table.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, Input, Output, ElementRef, Renderer2, OnInit, EventEmitter } from '@angular/core';
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

const WORKING = 'working';
const CLICKABLE = 'clickable';
const DRAGGING = 'dragging';

const DRAGSTART = 'dragstart';
const DRAGEND = 'dragend';
const DRAGENTER = 'dragenter';
const DRAGOVER = 'dragover';
const DRAGLEAVE = 'dragleave';
const DROP = 'drop';

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
    const trElm = this.elementRef.nativeElement;
    this._setDragElement(trElm);
    this._setDropElement(trElm);
  }

  /**
   * 親コンポーネントへ再描画を依頼する
   */
  @Output() ddDrowEvent = new EventEmitter();

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @param {Renderer2} renderer DOMを操作用
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
    const _dd_def = this._dd_def;
    const trElm = this.elementRef.nativeElement as HTMLTableRowElement;
    this._setDragElement(trElm);
    this._setDropElement(trElm);
    if (!_dd_def._getComData) {
      return;
    }
    const tbodyElm = trElm.closest('tbody') as HTMLTableSectionElement;
    const tableElm = trElm.closest('table') as HTMLTableElement;
    const theadTrElm = tableElm.querySelector('thead tr') as HTMLTableRowElement;
    if (!this._dd_com) {
      this._dd_com = _dd_def._getComData();
      const _dd_com = this._dd_com;
      _dd_com.tbody_elm = tbodyElm;
      _dd_com.drag_type = _dd_def.dragType as any ?? 'none';
    }
    const _dd_com = this._dd_com;
    if (!_dd_com.wk_tr_elm) {
      _dd_com.wk_tr_elm = this.renderer.createElement('tr') as HTMLTableRowElement;
      let tdElm = this.renderer.createElement('td') as HTMLTableCellElement;
      tdElm.colSpan = theadTrElm.childElementCount;
      const wk_tr_elm = _dd_com.wk_tr_elm;
      wk_tr_elm.appendChild(tdElm);
      wk_tr_elm.classList.add(WORKING);
      wk_tr_elm.addEventListener(DRAGENTER, this._dragEnter);
      wk_tr_elm.addEventListener(DRAGOVER, this._dragOver);
      wk_tr_elm.addEventListener(DROP, this._drop);
      _dd_com.wk_tr_destory = () => {
        const _wk_elm = wk_tr_elm;
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
      thisElm.addEventListener(DRAGSTART, this._dragStart);
      thisElm.addEventListener(DRAGEND, this._dragEnd);
      thisElm.classList.add(CLICKABLE);
    } else {
      thisElm.classList.remove(CLICKABLE);
      thisElm.removeEventListener(DRAGEND, this._dragEnd);
      thisElm.removeEventListener(DRAGSTART, this._dragStart);
    }
  }

  /**
   * ドロップ用のイベント等設定
   * @param thisElm HTMLElement
   */
  private _setDropElement = (thisElm: HTMLElement): void => {
    const droptarget = TYMDROP_DEF.indexOf(this._dd_def.dropType ?? 'none') >= 1;
    if (droptarget) {
      thisElm.addEventListener(DRAGENTER, this._dragEnter);
      thisElm.addEventListener(DRAGOVER, this._dragOver);
      thisElm.addEventListener(DROP, this._drop);
    } else {
      thisElm.removeEventListener(DROP, this._drop);
      thisElm.removeEventListener(DRAGOVER, this._dragOver);
      thisElm.removeEventListener(DRAGENTER, this._dragEnter);
    }
  }

  /**
   * ドラッグ開始時の関数
   * @param event DragEvent
   */
  private _dragStart = (event: DragEvent): void => {
    const [_dd_com, _dd_def] = [this._dd_com, this._dd_def];
    _dd_com.dragging_elm = this.elementRef.nativeElement;
    _dd_com.dragging_elm?.classList.add(DRAGGING);
    const rowdata = _dd_def._getRow!(this._this_row);
    _dd_def.doDragStart!(event, this._this_row, rowdata);
    _dd_com.drag_type = event.dataTransfer?.effectAllowed as any ?? 'none';
  }

  /**
   * ドラッグ終了時の関数を定義
   * @param event DragEvent
   */
  private _dragEnd = (event: DragEvent): void => {
    const [_dd_com, _dd_def] = [this._dd_com, this._dd_def];
    const _wk_elm = _dd_com.wk_tr_elm;
    const rowdata = _dd_def._getRow!(this._this_row);
    _dd_def.doDragEnd!(event, this._this_row, rowdata);
    _wk_elm?.parentElement?.removeChild(_wk_elm);
    _dd_com.dragging_elm?.classList.remove(DRAGGING);
    _dd_com.dragging_elm = null;
    DragDropDirective.listener.forEach((v) => v());
    DragDropDirective.listener.clear();
    this.ddDrowEvent.emit();
  }

  /**
   * ドロップターゲットに入った時の関数
   * @param event DragEvent
   */
  private _dragEnter = (event: DragEvent): void => {
    const [_dd_com, _dd_def] = [this._dd_com, this._dd_def];
    const tbodyElm = _dd_com.tbody_elm;
    const wk_tr_elm = _dd_com.wk_tr_elm as HTMLTableRowElement;
    const [rowIndex, trElm] = this._getRowIndex(event.target as HTMLElement);
    if (trElm == null || tbodyElm == null) return;
    const rowdata = _dd_def._getRow!(rowIndex);
    _dd_def.doDragEnter!(event, rowIndex, rowdata);

    switch (event.dataTransfer!.dropEffect) {
      case 'move':
        // 他のtable(等)からの移動
        if (_dd_com.dragging_elm == null) {
          if (wk_tr_elm.isConnected) {
            if (rowIndex < wk_tr_elm.rowIndex!) {
              tbodyElm.insertBefore(wk_tr_elm, trElm);
            } else {
              tbodyElm.insertBefore(wk_tr_elm, trElm.nextElementSibling);
            }
          } else {
            tbodyElm.insertBefore(wk_tr_elm, trElm);
          }
          if (!DragDropDirective.listener.has(_dd_com.wk_tr_destory)) {
            DragDropDirective.listener.add(_dd_com.wk_tr_destory);
          }
        }
        // 自のtable(等)から移動
        else {
          if (rowIndex < _dd_com.dragging_elm.rowIndex) {
            tbodyElm.insertBefore(_dd_com.dragging_elm, trElm);
          } else {
            tbodyElm.insertBefore(_dd_com.dragging_elm, trElm.nextElementSibling);
          }
        }

        break;

      case 'copy':
        if (wk_tr_elm.isConnected) {
          if (rowIndex < wk_tr_elm.rowIndex!) {
            tbodyElm.insertBefore(wk_tr_elm, trElm);
          } else {
            tbodyElm.insertBefore(wk_tr_elm, trElm.nextElementSibling);
          }
        } else {
          tbodyElm.insertBefore(wk_tr_elm, trElm);
        }
        if (!DragDropDirective.listener.has(_dd_com.wk_tr_destory)) {
          DragDropDirective.listener.add(_dd_com.wk_tr_destory);
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
    const _dd_def = this._dd_def;
    const [rowIndex,] = this._getRowIndex(event.target as HTMLElement);
    const rowdata = _dd_def._getRow!(rowIndex);
    _dd_def.doDragOver!(event, rowIndex, rowdata);
  }

  /**
   * ドロップターゲットにドロップされた時の関数
   * @param event DragEvent
   */
  private _drop = (event: DragEvent): void => {
    const _dd_def = this._dd_def;
    const [rowIndex,] = this._getRowIndex(event.target as HTMLElement);
    const rowdata = _dd_def._getRow!(rowIndex);
    _dd_def.doDrop!(event, rowIndex, rowdata);
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