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

  /**
   * 昇順マーク描画データ
   */
  private asc_point = "1 9, 9 9, 5 1";
  /**
   * 降順マーク描画データ
   */
  private desc_point = "1 1, 9 1, 5 9";
  /**
   * 対象外マーク描画データ
   */
  private none_point = "1 4, 9 6, 5 9, 1 6, 9 4, 5 1";

  /**
   * 昇順・降順マークタイプ {'asc','desc',other}
   */
  private _ordermk: string = '';

  /**
   * 親コンポーネントから受け取るデータ
   *
   * @type {string} 昇順・降順マークタイプ {'asc','desc',other}
   * @memberof OrdermkDirective
   */
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

  /**
   * svg polygon タグを生成
   * @param ordermk 昇順・降順マークタイプ {'asc','desc',other}
   */
  private _mkPolygon(ordermk: string) {
    const svgElm = this.elementRef.nativeElement as HTMLElement;
    let point = this.none_point;
    let width = '1.2';
    let style = 'opacity: .8';
    if (ordermk == 'asc') {
      point = this.asc_point;
    } else if (ordermk == 'desc') {
      point = this.desc_point;
    } else {
      width = '1';
      style = 'opacity: .2';
    }
    svgElm.innerHTML = `
      <polygon stroke-width="${width}px" points="${point}" fill="#fff" style="${style}" />`;
  }

}