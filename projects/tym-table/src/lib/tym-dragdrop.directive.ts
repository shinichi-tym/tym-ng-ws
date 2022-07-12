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

const NONE = 'none';

const CLASSLIST = (elm: HTMLElement | null) => elm?.classList;
const CLASSLIST_ADD = (elm: HTMLElement | null, cls: string) => CLASSLIST(elm)?.add(cls);
const CLASSLIST_DEL = (elm: HTMLElement | null, cls: string) => CLASSLIST(elm)?.remove(cls);

@Directive({
  selector: '[dragdrop]'
})
export class DragDropDirective implements OnInit {

  /**
   * 他のテーブルからのドロップ後のイベント用
   */
  private static _listener: Set<Function> = new Set();

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
    const trElm = this._elmRef.nativeElement;
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
   * @param {ElementRef} _elmRef このディレクティブがセットされたDOMへの参照
   * @param {Renderer2} _renderer DOMを操作用
   * @memberof DragDropDirective
   */
  constructor(
    private _elmRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  /**
   * 初期処理
   *
   * @memberof DragDropDirective
   */
  public ngOnInit() {
    const _dd_def = this._dd_def;
    const trElm = this._elmRef.nativeElement as HTMLTableRowElement;
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
      _dd_com.drag_type = _dd_def.dragType as any ?? NONE;
    }
    const _dd_com = this._dd_com;
    if (!_dd_com.wk_tr_elm) {
      const CREATE_ELM = (tag: string) => this._renderer.createElement(tag);
      _dd_com.wk_tr_elm = CREATE_ELM('tr') as HTMLTableRowElement;
      let tdElm = CREATE_ELM('td') as HTMLTableCellElement;
      tdElm.colSpan = theadTrElm.childElementCount;
      const wk_tr_elm = _dd_com.wk_tr_elm;
      wk_tr_elm.appendChild(tdElm);
      CLASSLIST_ADD(wk_tr_elm, WORKING);
      //イベント登録
      ([
        [DRAGENTER, this._dragEnter],
        [DRAGOVER, this._dragOver],
        [DROP, this._drop]
      ] as [string, any][]).forEach(i => wk_tr_elm.addEventListener(i[0], i[1]));
      _dd_com.wk_tr_destory = () => {
        const _wk_elm = wk_tr_elm;
        _wk_elm?.parentElement?.removeChild(_wk_elm);
        this.ddDrowEvent.emit();
      }
    }
  }

  /**
   * ドラッグ用のイベント等設定
   * @param tgtElm HTMLElement
   */
  private _setDragElement = (tgtElm: HTMLElement): void => {
    const draggable = TYMDRAG_DEF.indexOf(this._dd_def.dragType ?? NONE) >= 1;
    tgtElm.draggable = this._drag_elm && draggable;
    const evinfos: [string, any][] = [
      [DRAGSTART, this._dragStart],
      [DRAGEND, this._dragEnd]
    ];
    if (tgtElm.draggable) {
      evinfos.forEach(inf => tgtElm.addEventListener(inf[0], inf[1]));
      CLASSLIST_ADD(tgtElm, CLICKABLE);
    } else {
      CLASSLIST_DEL(tgtElm, CLICKABLE);
      evinfos.forEach(inf => tgtElm.removeEventListener(inf[0], inf[1]));
    }
  }

  /**
   * ドロップ用のイベント等設定
   * @param tgtElm HTMLElement
   */
  private _setDropElement = (tgtElm: HTMLElement): void => {
    const droptarget = TYMDROP_DEF.indexOf(this._dd_def.dropType ?? NONE) >= 1;
    const evinfos: [string, any][] = [
      [DRAGENTER, this._dragEnter],
      [DRAGOVER, this._dragOver],
      [DROP, this._drop]
    ];
    if (droptarget) {
      evinfos.forEach(inf => tgtElm.addEventListener(inf[0], inf[1]));
    } else {
      evinfos.forEach(inf => tgtElm.removeEventListener(inf[0], inf[1]));
    }
  }

  /**
   * ドラッグ開始時の関数
   * @param event DragEvent
   */
  private _dragStart = (event: DragEvent): void => {
    const { _dd_com, _dd_def } = this;
    _dd_com.dragging_elm = this._elmRef.nativeElement;
    CLASSLIST_ADD(_dd_com.dragging_elm, DRAGGING);
    const rowdata = _dd_def._getRow!(this._this_row);
    _dd_def.doDragStart!(event, this._this_row, rowdata);
    _dd_com.drag_type = event.dataTransfer?.effectAllowed as any ?? NONE;
  }

  /**
   * ドラッグ終了時の関数を定義
   * @param event DragEvent
   */
  private _dragEnd = (event: DragEvent): void => {
    const { _dd_com, _dd_def } = this;
    const _wk_elm = _dd_com.wk_tr_elm;
    const rowdata = _dd_def._getRow!(this._this_row);
    _dd_def.doDragEnd!(event, this._this_row, rowdata);
    _wk_elm?.parentElement?.removeChild(_wk_elm);
    CLASSLIST_DEL(_dd_com.dragging_elm, DRAGGING);
    _dd_com.dragging_elm = null;
    const listener = DragDropDirective._listener;
    listener.forEach((v) => v());
    listener.clear();
    this.ddDrowEvent.emit();
  }

  /**
   * ドロップターゲットに入った時の関数
   * @param event DragEvent
   */
  private _dragEnter = (event: DragEvent): void => {
    const { _dd_com, _dd_def } = this;
    const tbodyElm = _dd_com.tbody_elm;
    let wk_tr_elm = _dd_com.wk_tr_elm as HTMLTableRowElement;
    const [rowIndex, trElm] = this._getRowIndex(event.target as HTMLElement);
    if (trElm == null || tbodyElm == null) return;
    const rowdata = _dd_def._getRow!(rowIndex);
    _dd_def.doDragEnter!(event, rowIndex, rowdata);
    const listener = DragDropDirective._listener;
    let _trElm;
    const getTr1 = () => (wk_tr_elm.isConnected)
      ? (rowIndex < wk_tr_elm.rowIndex!) ? trElm : trElm.nextElementSibling : trElm;
    const addListener = (f: any = _dd_com.wk_tr_destory) =>
      (listener.has(f)) ? listener : listener.add(f);
    switch (event.dataTransfer!.dropEffect) {
      case 'move':
        // 他のtable(等)からの移動
        if (_dd_com.dragging_elm == null) {
          _trElm = getTr1();
          addListener();
        }
        // 自のtable(等)から移動
        else {
          _trElm = (rowIndex < _dd_com.dragging_elm.rowIndex)
            ? trElm : trElm.nextElementSibling;
          wk_tr_elm = _dd_com.dragging_elm;
        }

        break;

      case 'copy':
        _trElm = getTr1();
        addListener();

        break;

      default:
        return;
    }
    tbodyElm.insertBefore(wk_tr_elm, _trElm);;
  }

  /**
   * ドロップターゲットの上にある時，ドロップされた時の関数
   * @param event DragEvent
   */
  private _dragOverDrop = (event: DragEvent, func: any): void => {
    const _dd_def = this._dd_def;
    const [rowIndex,] = this._getRowIndex(event.target as HTMLElement);
    const rowdata = _dd_def._getRow!(rowIndex);
    func!(event, rowIndex, rowdata);
  }

  /**
   * ドロップターゲットの上にある時の関数
   * @param event DragEvent
   */
  private _dragOver = (event: DragEvent): void =>
    this._dragOverDrop(event, this._dd_def.doDragOver);

  /**
   * ドロップターゲットにドロップされた時の関数
   * @param event DragEvent
   */
  private _drop = (event: DragEvent): void =>
    this._dragOverDrop(event, this._dd_def.doDrop);

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