/*!
 * tym-table.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TymTableUtilities {

  constructor() { }

  /**
   * セルを広げる (*table* > thead > tr > th > *div*)
   * 
   * @param {HTMLTableElement} tableElm 対象のtableエレメント
   * @param {HTMLDivElement} divElm 対象のdivエレメント
   */
  public static _widen(tableElm: HTMLTableElement, divElm: HTMLDivElement) {

    const cntnrElm = tableElm.parentElement as HTMLElement; // ngx-tym-table エレメント
    const scrolElm = cntnrElm.parentElement as HTMLElement; // div等のスクロールするエレメント
    const thElm = divElm.parentElement as HTMLTableCellElement; // *th* エレメント

    const scrollLeft = scrolElm.scrollLeft; // スクロール状態を保持
    const cntnrRect = cntnrElm.getBoundingClientRect();
    const cellElms = tableElm.querySelectorAll(`tbody tr td:nth-child(${thElm.cellIndex + 1})`);
    if (cellElms.length <= 0) return;
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
   * 全てのセルを広げる (*table* > thead > tr > th > div)
   *
   * @param {HTMLTableElement} tableElm 対象のtableエレメント
   */
  public static _allWiden(tableElm: HTMLTableElement) {
    const divElms = tableElm.querySelectorAll(`thead tr th div`);
    divElms.forEach(divElm => {
      if (divElm.hasAttribute('resize'))
        TymTableUtilities._widen(tableElm, divElm as HTMLDivElement);
    });
  }
}