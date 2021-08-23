/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { TYM_DDDEF } from "./tym-table.component";

@Directive({
  selector: '[dragdrop]'
})
export class DragDropDirective implements OnInit {

  /**
   * 操作の種類 {none,copy,link,move}
   */
  private _drag_tgt: boolean = false;
  private _drag_row: number = -1;
  private _dd_def: TYM_DDDEF = {};

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {string} 操作の種類 {none,copy,link,move}
   * @memberof DragDropDirective
   */
  @Input() set dragdrop(dragdrop: any[]) {
    [this._drag_tgt, this._drag_row, this._dd_def] = dragdrop;
    this._setDragElement(this.elementRef.nativeElement);
    this._setDropElement(this.elementRef.nativeElement);
  }

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
    thisElm.draggable = this._drag_tgt && draggable;
    if (draggable) {
      thisElm.addEventListener('dragstart', this._dragStart);
      thisElm.addEventListener('dragend', this._dragEnd);
    } else {
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
    const rowdata = this._dd_def._getRow!(this._drag_row);
    this._dd_def.doDragStart!(event, this._drag_row, rowdata);
  }

  /**
   * ドラッグ終了時の関数を定義
   * @param event DragEvent
   */
  private _dragEnd = (event: DragEvent): void => {
    const rowdata = this._dd_def._getRow!(this._drag_row);
    this._dd_def.doDragEnd!(event, this._drag_row, rowdata);
  }

  /**
   * ドロップターゲットに入った時の関数
   * @param event DragEvent
   */
  private _dragEnter = (event: DragEvent): void => {
    const rowdata = this._dd_def._getRow!(this._drag_row);
    this._dd_def.doDragEnter!(event, this._drag_row, rowdata);
  }

  /**
   * ロップターゲットの上にある時の関数
   * @param event DragEvent
   */
  private _dragOver = (event: DragEvent): void => {
    const rowdata = this._dd_def._getRow!(this._drag_row);
    this._dd_def.doDragOver!(event, this._drag_row, rowdata);
  }

  /**
   * ドロップターゲットにドロップされた時の関数
   * @param event DragEvent
   */
  private _drop = (event: DragEvent): void => {
    const rowdata = this._dd_def._getRow!(this._drag_row);
    this._dd_def.doDrop!(event, this._drag_row, rowdata);
  }
}
const TYMDRAG_DEF: string[] = ['none', 'copy', 'link', 'move'];
const TYMDROP_DEF: string[] = [
  'none', 'copy', 'copyLink', 'copyMove', 'link', 'linkMove', 'move', 'all', 'uninitialized'
];