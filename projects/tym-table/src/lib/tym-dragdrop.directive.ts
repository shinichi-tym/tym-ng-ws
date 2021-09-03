/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, Input, Output, ElementRef, OnInit ,EventEmitter} from '@angular/core';
import { TYM_DDDEF } from "./tym-table.interface";

@Directive({
  selector: '[dragdrop]'
})
export class DragDropDirective implements OnInit {

  /**
   * 操作の種類 {none,copy,link,move}
   */
  private _drag_elm: boolean = false;
  private _this_row: number = -1;
  private _dd_def: TYM_DDDEF = {};
  private static _drag_row: number = -1;

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
   * @memberof DragDropDirective
   */
  constructor(
    private elementRef: ElementRef
  ) { }

  /**
   * 初期処理
   *
   * @memberof DragDropDirective
   */
  public ngOnInit() {
    this._setDragElement(this.elementRef.nativeElement);
    this._setDropElement(this.elementRef.nativeElement);
  }

  /**
   * ドラッグ用のイベント等設定
   * @param thisElm HTMLElement
   */
  private _setDragElement = (thisElm: HTMLElement): void => {
    const draggable = TYMDRAG_DEF.indexOf(this._dd_def.dragType || 'none') >= 1;
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
    const droptarget = TYMDROP_DEF.indexOf(this._dd_def.dropType || 'none') >= 1;
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
    DragDropDirective._drag_row = this._this_row;
    (this.elementRef.nativeElement as HTMLElement).classList.add('moving');
    const rowdata = this._dd_def._getRow!(this._this_row);
    this._dd_def.doDragStart!(event, this._this_row, rowdata);
  }

  /**
   * ドラッグ終了時の関数を定義
   * @param event DragEvent
   */
  private _dragEnd = (event: DragEvent): void => {
    const rowdata = this._dd_def._getRow!(this._this_row);
    this._dd_def.doDragEnd!(event, this._this_row, rowdata);
    this.ddDrowEvent.emit();
    DragDropDirective._drag_row = -1;
  }

  /**
   * ドロップターゲットに入った時の関数
   * @param event DragEvent
   */
  private _dragEnter = (event: DragEvent): void => {
    const [rowIndex, trElm] = this._getRowIndex(event.target as HTMLElement);
    if (DragDropDirective._drag_row == rowIndex) return;
    if (trElm.classList.contains('moving')) return;

    let elm: HTMLElement;
    for (elm = event.target as HTMLElement; elm.tagName != "TBODY"; elm = elm.parentElement!) { }
    const tbodyElm = elm as HTMLTableSectionElement;

    let newChild: number, refChild: number;
    if (rowIndex > DragDropDirective._drag_row) {
      [newChild, refChild] = [rowIndex, DragDropDirective._drag_row]
    } else {
      [newChild, refChild] = [DragDropDirective._drag_row, rowIndex]
    }
    tbodyElm.insertBefore(tbodyElm.childNodes[newChild], tbodyElm.childNodes[refChild]);
    DragDropDirective._drag_row = rowIndex;

    const rowdata = this._dd_def._getRow!(rowIndex);
    this._dd_def.doDragEnter!(event, rowIndex, rowdata);
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
    for (; elm.tagName != "TR"; elm = elm.parentElement!) { }
    let trElm = elm as HTMLTableRowElement;
    return [trElm.rowIndex - 1, trElm];
  }
}
const TYMDRAG_DEF: string[] = [
  'none', 'copy', 'copyLink', 'copyMove', 'link', 'linkMove', 'move', 'all', 'uninitialized'
];
const TYMDROP_DEF: string[] = ['none', 'copy', 'link', 'move'];