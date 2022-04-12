/*!
 * tym-directive.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, ViewEncapsulation, AfterViewInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'tym-table-view',
  templateUrl: './tym-table-view.component.html',
  styleUrls: ['./tym-table-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TymTableViewComponent implements AfterViewInit {

  @Input() cols: string[] = [];

  @Input() data: string[][] = [];

  @Input() lastsp: boolean = true;

  @Input() maxWidth: number = 200;

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このコンポーネントがセットされたDOMへの参照
   * @memberof TymTableViewComponent
   */
  constructor(private elementRef: ElementRef) { }

  /**
   * ビューを初期化した後の処理
   */
  ngAfterViewInit() {
    const thisElm = this.elementRef.nativeElement as HTMLElement; // tym-table-view
    const firstElementChild = (elm: HTMLElement) => elm.firstElementChild;
    const tableElm = firstElementChild(thisElm) as HTMLTableElement; // table
    const theadElm = firstElementChild(tableElm) as HTMLTableSectionElement; // thead
    const tableTr = firstElementChild(theadElm) as HTMLTableRowElement; // tr
    tableTr.childNodes.forEach(node => {
      const elm = node as HTMLElement;
      if (elm.tagName == 'TH') { // #comment 除去
        const realStyle = window.getComputedStyle(elm);
        elm.style.width = (elm.clientWidth > this.maxWidth)
          ? `${this.maxWidth}px`
          : realStyle.width;
      }
    });
    tableElm.style.width = (this.lastsp)
      ? ((tableTr.lastElementChild as HTMLElement).style.width = '', '100%')
      : 'fit-content';
  }
}