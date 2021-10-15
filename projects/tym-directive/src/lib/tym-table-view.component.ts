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

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof TymResizeDirective
   */
  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit(): void {
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const tableElm: HTMLTableElement = thisElm.firstElementChild as any;
    const tableTr: HTMLTableRowElement = tableElm.firstChild!.firstChild as HTMLTableRowElement;
    tableTr.childNodes.forEach(node => {
      const elm = node as HTMLElement;
      if (elm.tagName == 'TH') { // #comment 除去
        const realStyle = window.getComputedStyle(elm);
        elm.style.width = (elm.clientWidth > 200)
          ? '200px'
          : realStyle.width;
      }
    });
    if (this.lastsp) {
      (tableTr.lastElementChild as HTMLElement).style.width = '';
      tableElm.style.width = '100%';
    } else {
      tableElm.style.width = 'fit-content';
    }
  }
}