/*!
 * tym-directive.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
@Directive({
  selector: '[tym-table-edit],[tymTableEdit]'
})
export class TymTableEditDirective implements AfterViewInit {

  private static idnum = 0;
  private thisElm: HTMLElement; // this table element

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof TymTableEditDirective
   */
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.thisElm = this.elementRef.nativeElement as HTMLElement;
  }

  /**
   * ビューを初期化した後の処理
   */
  public ngAfterViewInit(): void {
    //---------------------------------------------------------------
    // ..
    const tbody = this.thisElm;
    if (tbody.tagName != 'TBODY') return;
    const table = tbody.closest('table') as HTMLTableElement;
    const thead = table.firstElementChild;
    const theadRowNum = (thead?.tagName == 'THEAD') ? thead?.childElementCount : 0;
    const contentName = '_tymtableedit-' + TymTableEditDirective.idnum++;
    const maxrow = tbody.children.length - 1;
    const maxcol = tbody.children[0].children.length - 1;
    //---------------------------------------------------------------
    // ..
    let editElm = null as HTMLTableCellElement | null; // edited td cell
    let crntElm = tbody.children[0].children[0] as HTMLTableCellElement; // current td cell
    //---------------------------------------------------------------
    // ..
    const cell = (r: number, c: number) => tbody.children[r]?.children[c] as HTMLTableCellElement;
    const cellRowCol = (td: HTMLTableCellElement | null) =>
      (td) ? [(td.parentElement as HTMLTableRowElement).rowIndex - theadRowNum, td.cellIndex] : [0, 0];
    const classlist = (elm: HTMLElement) => elm.classList;
    const classrm = (elm: HTMLElement, cls: string) => classlist(elm).remove(cls);
    const classadd = (elm: HTMLElement, cls: string) => classlist(elm).add(cls);
    /****************************************************************
     * set current element (crntElm, style)
     * @param elm 対象エレメント
     */
    const setCurrent = (elm: HTMLTableCellElement) => {
      const crn = 'crn';
      classrm(crntElm, crn);
      classadd(elm, crn);
      crntElm = elm;
    }
    //---------------------------------------------------------------
    // set tab index
    tbody.childNodes.forEach(tr =>
      tr.childNodes.forEach(td => (td as HTMLTableCellElement).tabIndex = -1));
    //---------------------------------------------------------------
    // create : style
    tbody.setAttribute(contentName, '');
    const styleElement = this.renderer.createElement('style');
    styleElement.setAttribute(contentName, '');
    table.parentElement?.insertBefore(styleElement, table);
    styleElement.innerText = [
      `tbody[${contentName}] .crn{outline:solid 2px #000;outline-offset:-2px;}`,
      `tbody[${contentName}] [contentEditable]{background-color:#bfc;}`,
    ].join('');
    setCurrent(cell(0, 0));
    /****************************************************************
     * mouse down event
     * @param e MouseEvent
     */
    const event_mousedown = (e: MouseEvent) => {
      let td = e.target as HTMLTableCellElement;
      if (e.detail == 1) {
        setCurrent(td);
      } if (e.detail == 2) {
        toEdit(td);
        e.preventDefault();
      }
    }
    tbody.addEventListener('mousedown', event_mousedown);
    /****************************************************************
     * keypress event
     * @param e KeyboardEvent
     */
    const event_keypress = (e: KeyboardEvent) => {
      const td = e.target as HTMLTableCellElement;
      if (!editElm) {
        toEdit(td);
      }
    }
    tbody.addEventListener('keypress', event_keypress);
    /****************************************************************
     * key down event
     * @param e KeyboardEvent
     */
    const event_keydown = (e: KeyboardEvent) => {
      const thisCell = e.target as HTMLTableCellElement;
      const [thisRowIx, thisColIx] = cellRowCol(thisCell);
      //-------------------------------------------------------------
      /** 矢印によるフォーカスの上下左右移動                       */
      const arrow = (rowcol: number[]) => {
        const td = cell(rowcol[0], rowcol[1]);
        td.blur();
        td.focus();
        setCurrent(td);
      }
      const arrowmove = (isUpDown: boolean, isUpOrLeft: boolean) => {
        const [A, B, C] = (isUpDown)
          ? (isUpOrLeft) ? [(thisRowIx > 0), -1, 0] : [(thisRowIx < maxrow), 1, 0]
          : (isUpOrLeft) ? [(thisColIx > 0), 0, -1] : [(thisColIx < maxcol), 0, 1];
        arrow(A ? [thisRowIx + B, thisColIx + C] : [thisRowIx, thisColIx]);
      }
      //-------------------------------------------------------------
      const eKey = e.key + ((!!editElm && (e.key != 'Tab' && e.key != 'Enter')) ? '_EDIT' : '');
      const keya = new Map<string, Function>([
        ['ArrowDown', () => arrowmove(true, false)],
        ['ArrowUp', () => arrowmove(true, true)],
        ['ArrowRight', () => arrowmove(false, false)],
        ['ArrowLeft', () => arrowmove(false, true)],
        ['Tab', () => arrowmove(false, e.shiftKey)],
        ['Enter', () => arrowmove(true, e.shiftKey)],
        ['Home', () => arrow(e.ctrlKey ? [0, 0] : [thisRowIx, 0])],
        ['End', () => arrow(e.ctrlKey ? [maxrow, maxcol] : [thisRowIx, maxcol])],
        ['F2', () => toEdit(thisCell)],
        ['Backspace', () => (toEdit(thisCell), thisCell.innerText = '')],
        ['Delete', () => thisCell.innerText = ''],
        ['Escape_EDIT', () => {
          thisCell.innerText = beforeValue!;
          thisCell.blur();
          thisCell.focus();
        }],
      ]);
      const keyp = keya.get(eKey);
      if (keyp) {
        keyp();
        e.preventDefault();
      }
    }
    tbody.addEventListener('keydown', event_keydown);
    /****************************************************************
     * Escapeキー戻値用
     */
    let beforeValue: string | null;

    /****************************************************************
     * フォーカスアウトイベント処理，表示モードにする
     */
    const editBlue = () => {
      if (editElm) {
        editElm.removeEventListener('blur', editBlue);
        editElm.removeAttribute('contentEditable');
      }
      beforeValue = null;
      editElm = null;
    }

    /****************************************************************
     * 対象セルを編集モードにする
     * @param td 対象エレメント
     */
    const toEdit = (td: HTMLTableCellElement) => {
      beforeValue = td.innerText;
      td.contentEditable = 'true';
      td.addEventListener('blur', editBlue);
      const [sel, rng] = [window.getSelection(), document.createRange()];
      rng.selectNodeContents(td);
      sel?.removeAllRanges();
      sel?.addRange(rng)
      editElm = td;
    }
  }
}