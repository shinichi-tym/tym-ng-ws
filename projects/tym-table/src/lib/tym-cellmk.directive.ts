/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { TYM_COL } from './tym-table.interface'

@Directive({
  selector: '[cellmk]'
})
export class CellmkDirective implements OnInit {

  private _txt?: string = '';
  private _col: TYM_COL = { title: '' };

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {string} 操作の種類 {none,copy,link,move}
   * @memberof DragDropDirective
   */
  @Input() set cellmk(cellmk: any[]) {
    [this._txt, this._col] = cellmk;
  }

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof CellmkDirective
   */
  constructor(
    private elementRef: ElementRef
  ) {
  }

  /**
   * 初期処理
   *
   * @memberof CellmkDirective
   */
  public ngOnInit() {
    const svgStyle = 'position:absolute;top:calc(var(--bd-pa) + .6em);right:.2em;width:.7em;height:.7em';
    // const svgPopup = ''
    //   + `<rect x="1" y="9" width="22" height="22" fill="none" stroke="blue" stroke-width="2"/>`
    //   + `<rect x="10" y="0" width="22" height="22" fill="#88f" stroke="blue"/>`;
    const svgPopup = ''
      + `<rect x="10" y="0" width="22" height="22" fill="#88f" stroke="blue"/>`
      + `<polyline points="5,6 1,30 23,27" fill="none" stroke="blue" stroke-width="2"/>`;
    const tdElm = this.elementRef.nativeElement as HTMLElement;
    tdElm.title = this._txt||'';
    tdElm.style.textAlign = this._col.align || '';
    if (this._col.clickable) {
      tdElm.style.cursor = 'pointer';
      tdElm.style.paddingRight = '1em';
      tdElm.style.position = 'relative';
      tdElm.style.textDecoration = 'underline blue dashed 1px';
      tdElm.innerHTML = `${tdElm.title}`
        + `<svg style="${svgStyle}" viewBox="0 0 32 32">${svgPopup}</svg>`
    } else {
      let tnode = document.createTextNode(tdElm.title);
      tdElm.appendChild(tnode);
    }
  }
}