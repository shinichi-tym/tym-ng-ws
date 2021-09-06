import { Component, ViewEncapsulation, AfterViewInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'tym-table-view',
  templateUrl: './tym-table-view.component.html',
  styleUrls: ['./tym-table-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TymTableViewComponent implements AfterViewInit {

  @Input() public set cols(cols: string[]) {
    this._cols = cols;
  }
  @Input() public set data(data: string[][]) {
    this._data = data;
  }

  static cols: string[] = [];
  static data: string[][] = [];

  _cols: string[] = [];
  _data: string[][] = [];

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof TymResizeDirective
   */
  constructor(
    private elementRef: ElementRef
  ) {
    this._cols = TymTableViewComponent.cols;
    this._data = TymTableViewComponent.data;
  }

  ngAfterViewInit(): void {
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const tableElm: HTMLTableElement = thisElm.firstElementChild as any;
    tableElm.firstChild!.firstChild!.childNodes.forEach(node => {
      const elm = node as HTMLElement;
      if (elm.tagName == 'TH') {
        const realStyle = window.getComputedStyle(elm);
        elm.style.width = (elm.clientWidth > 200)
          ? '200px'
          : realStyle.width;
      }
    });
    (tableElm.firstChild!.firstChild!.lastChild as HTMLElement).style.width = '';
    tableElm.style.width = '100%';
  }
}