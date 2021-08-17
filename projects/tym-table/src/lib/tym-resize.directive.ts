/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, ElementRef, OnInit } from '@angular/core';

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
  }

  /**
   * 初期処理
   *
   * @memberof ResizeDirective
   */
  public ngOnInit() {
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const parentElm: HTMLElement = thisElm.parentElement || thisElm;
    const observer = new MutationObserver(() => {
      parentElm.style.width = thisElm.style.width;
      // parentElm.style.height = thisElm.style.height;
    });
    observer.observe(thisElm, { attributes: true, attributeFilter: ["style"] });
  }
}