/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[ordermk]'
})
export class OrdermkDirective implements OnInit {

  private asc_point = "1 9, 9 9, 5 1";
  private desc_point = "1 1, 9 1, 5 9";
  private none_point = "1 4, 9 6, 5 9, 1 6, 9 4, 5 1";

  private _ordermk: string = '';

  @Input() public set ordermk(ordermk: string) {
    this._ordermk = ordermk;
    this._mkPolygon(ordermk);
  }

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof OrdermkDirective
   */
  constructor(
    private elementRef: ElementRef
  ) {
  }

  /**
   * 初期処理
   *
   * @memberof OrdermkDirective
   */
  public ngOnInit() {
    this._mkPolygon(this._ordermk);
  }

  private _mkPolygon(ordermk: string) {
    const svgElm = this.elementRef.nativeElement as HTMLElement;
    let point = '';
    let width = '1.2';
    let style = 'opacity: .8';
    if (ordermk == 'asc') {
      point = this.asc_point;
    } else if (ordermk == 'desc') {
      point = this.desc_point;
    } else {
      point = this.none_point;
      width = '1';
      style = 'opacity: .2';
    }
    svgElm.innerHTML = `
      <polygon stroke-width="${width}px" points="${point}" fill="#fff" style="${style}" />`;
  }

}