/*!
 * tym-table.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, ElementRef, OnInit } from '@angular/core';
import { TymTableUtilities } from "./tym-table.utilities";

@Directive({
  selector: '[resize]'
})
export class ResizeDirective implements OnInit {

  /**
   * コンストラクタ
   *
   * @param {ElementRef} _elmRef このディレクティブがセットされたDOMへの参照
   * @memberof ResizeDirective
   */
  constructor(
    private _elmRef: ElementRef
  ) {
    this._thisElm = this._elmRef.nativeElement;
  }

  /**
   * this native element
   */
  private _thisElm: HTMLDivElement;

  /**
   * 初期処理
   *
   * @memberof ResizeDirective
   */
  public ngOnInit() {
    const thisElm = this._thisElm;
    const thElm = thisElm.parentElement as HTMLTableCellElement;
    const tableElm = thisElm.closest('table') as HTMLTableElement;
    thisElm.addEventListener('dblclick', (e: MouseEvent) => {
      if (e.shiftKey) {
        TymTableUtilities._allWiden(tableElm);
      } else {
        TymTableUtilities._widen(tableElm, thisElm);
      }
    });
    const observer = new MutationObserver(() => {
      thElm.style.width = thisElm.style.width;
    });
    observer.observe(thisElm, { attributes: true, attributeFilter: ["style"] });
  }
}