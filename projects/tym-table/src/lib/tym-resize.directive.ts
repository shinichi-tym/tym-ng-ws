/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
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
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof ResizeDirective
   */
  constructor(
    private elementRef: ElementRef
  ) {
    this.thisElm = this.elementRef.nativeElement;
  }

  /**
   * this native element
   */
  private thisElm: HTMLDivElement;

  /**
   * 初期処理
   *
   * @memberof ResizeDirective
   */
  public ngOnInit() {
    const thisElm = this.thisElm;
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