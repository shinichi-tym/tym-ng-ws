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
    const thiElm = this.thisElm = this.elementRef.nativeElement;
    this.thElm = thiElm.parentElement;
  }

  /**
   * this native element
   */
  private thisElm: HTMLDivElement;

  /**
   * this native element (th)
   */
  private thElm: HTMLTableCellElement;

  /**
   * セルを広げる (table > thead > tr > th > div)
   * 
   * @param {HTMLTableElement} tableElm 対象のtableエレメント
   * @param {HTMLTableCellElement} thElm 対象のthエレメント
   * @param {HTMLDivElement} divElm 対象のdivエレメント
   */
  private widen(tableElm: HTMLTableElement, thElm: HTMLTableCellElement, divElm: HTMLDivElement) {

    const cntnrElm = tableElm.parentElement as HTMLElement; // ngx-tym-table エレメント
    const scrolElm = cntnrElm.parentElement as HTMLElement; // div等のスクロールするエレメント

    const scrollLeft = scrolElm.scrollLeft; // スクロール状態を保持
    const cntnrRect = cntnrElm.getBoundingClientRect();
    const cellElms = tableElm.querySelectorAll(`tbody tr td:nth-child(${thElm.cellIndex + 1})`);
    // padding, margin サイズを求める
    const realStyle = window.getComputedStyle(cellElms.item(0));
    const padSize = ''
      + `${realStyle.paddingLeft} + ${realStyle.paddingRight} + `
      + `${realStyle.marginLeft} + ${realStyle.marginRight}`;
    thElm.style.width = divElm.style.width = 'var(--bd-wd)';// 一時的にセルのサイズを縮める
    // 全ての行をチェックし最大widthを求める (tbody > tr > td)
    let maxWidth = Array.from(cellElms).reduce((a, b) => a.scrollWidth > b.scrollWidth ? a : b).scrollWidth;
    thElm.style.width = divElm.style.width
      = `calc(${Math.min(maxWidth, (cntnrRect.width * .7))}px + ${padSize})`;
    scrolElm.scrollLeft = scrollLeft; // スクロール状態を回復
  }

  /**
   * 初期処理
   *
   * @memberof ResizeDirective
   */
  public ngOnInit() {
    const [thisElm, thElm] = [this.thisElm, this.thElm];
    const tableElm = thisElm.closest('table') as HTMLTableElement;
    thisElm.addEventListener('dblclick', (e: MouseEvent) => {
      if (e.shiftKey) {
        const thElms = tableElm.querySelectorAll(`thead tr th div`);
        thElms.forEach(elm => {
          if (elm.hasAttribute('resize')) this.widen(tableElm,
            elm.parentElement as HTMLTableCellElement, elm as HTMLTableCellElement);
        });
      } else {
        this.widen(tableElm, thElm, thisElm);
      }
    });
    const observer = new MutationObserver(() => {
      thElm.style.width = thisElm.style.width;
    });
    observer.observe(thisElm, { attributes: true, attributeFilter: ["style"] });
  }
}