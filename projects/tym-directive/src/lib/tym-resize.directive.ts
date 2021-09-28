/*!
 * tym-directive.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[tym-resize],[tymResize],[tymResizeCallback]'
})
export class TymResizeDirective implements OnInit {

  /**
   * リサイズ方向
   * 
   *  {'both','horizontal','vertical','none'}, 規定値:horizontal
   */
  @Input() tymResize: string = 'horizontal';

  /**
   * リサイズイベント関数
   * 
   *  規定値:親エレメントリサイズ処理
   * @param elm HTMLElement
   * @param parentElm 親HTMLElement
   */
  @Input() tymResizeCallback = (thisElm: HTMLElement, parentElm: HTMLElement): void => {
    parentElm.style.width = thisElm.style.width;
    parentElm.style.height = thisElm.style.height;
  }

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof TymResizeDirective
   */
  constructor(
    private elementRef: ElementRef
  ) {
  }

  /**
   * 初期処理
   *
   * @memberof TymResizeDirective
   */
  public ngOnInit() {
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const parentElm: HTMLElement = thisElm.parentElement ?? thisElm;
    thisElm.style.resize = this.tymResize;
    const observer = new MutationObserver(() => this.tymResizeCallback(thisElm, parentElm));
    observer.observe(thisElm, { attributes: true, attributeFilter: ["style"] });
  }
}