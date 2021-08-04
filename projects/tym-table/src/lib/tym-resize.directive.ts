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
    const resizeable = this.elementRef.nativeElement;
    const observer = new MutationObserver(() => {
      resizeable.parentNode.style.width = resizeable.style.width;
      resizeable.parentNode.style.height = resizeable.style.height;
    });
    observer.observe(resizeable, { attributes: true, attributeFilter: ["style"] });
  }
}