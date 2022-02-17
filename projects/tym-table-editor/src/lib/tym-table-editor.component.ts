/*!
 * tym-directive.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, AfterViewInit, ElementRef, Renderer2, Input, Output } from '@angular/core';

const num2 = (n: number) => ('00' + (n + 1)).slice(-2);

@Component({
  selector: 'ngx-tym-table-editor',
  template: '<table><tbody></tbody></table>',
  styleUrls: ['./tym-table-editor.component.scss']
})
export class TymTableEditorComponent implements AfterViewInit {

  private thisElm: HTMLElement; // this table element
  private editElm: HTMLElement | null = null; // edited td cell
  private crntElm: HTMLElement | null = null; // current td cell

  private history!: [{ b: [{ x: number, y: number, v: string }], a: [{ x: number, y: number, v: string }] }];

  @Input() row: number = 30;
  @Input() col: number = 20;
  @Input() data: any[][] = [['']];

  /**
   * コンストラクタ
   *
   * @memberof TymTreeViewComponent
   */
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.thisElm = this.elementRef.nativeElement as HTMLElement;
  };

  /**
   * ビューを初期化した後の処理
   */
  public ngAfterViewInit(): void {
    //---------------------------------------------------------------
    // ..
    const tableElm = this.thisElm.firstElementChild as HTMLElement;
    const tbodyElm = tableElm.firstElementChild as HTMLElement;
    //---------------------------------------------------------------
    // ..
    const maxrow = this.row;
    const maxcol = this.col;
    const nosels = { r1: -1, c1: -1, r2: -1, c2: -1 };
    /**  0:not move, 1:cell, 2:col, 3:row */
    let mousemv: number = 0;
    let selects: { r1: number, c1: number, r2: number, c2: number } = { ...nosels };
    //---------------------------------------------------------------
    // ..
    let scrollElm: HTMLElement = this.thisElm;
    let { overflowX, overflowY } = window.getComputedStyle(scrollElm!);
    if (!(overflowX == 'auto' || overflowX == 'scroll' || overflowY == 'auto' || overflowY == 'scroll')) {
      scrollElm = scrollElm.parentElement as HTMLElement;
    }
    //---------------------------------------------------------------
    // ..
    const checkset = (max: number, n: number) => (-1 > n) ? -1 : (n > max) ? max : n;
    const setRangeFirst2 = (r1: number, c1: number) =>
      [selects.r1, selects.c1] = [checkset(maxrow, r1), checkset(maxcol, c1)];
    const setRangeLast2 = (r2: number, c2: number) =>
      [selects.r2, selects.c2] = [checkset(maxrow, r2), checkset(maxcol, c2)];
    const getCellXY = (td: HTMLElement) =>
      [parseInt(td.dataset.row!), parseInt(td.dataset.col!)];
    const setRangeFirst = (td: HTMLElement) => [selects.r1, selects.c1] = getCellXY(td);
    const setRangeLast = (td: HTMLElement) => [selects.r2, selects.c2] = getCellXY(td);
    const cell = (r: number, c: number) => tbodyElm.children[r].children[c] as HTMLTableCellElement;
    //---------------------------------------------------------------
    // create element
    const createElm = (name: string) => this.renderer.createElement(name) as HTMLElement;
    //---------------------------------------------------------------
    // create th element
    const createTh = (tx: string, isHead: boolean) => {
      const th = createElm('th');
      th.innerText = tx;
      const dataset = th.dataset;
      [dataset.row, dataset.col] = (isHead) ? ['', tx] : [tx, ''];
      return th;
    }
    //---------------------------------------------------------------
    // create td element
    const createTd = (row: number, col: number) => {
      const td = createElm('td');
      td.tabIndex = -1;
      const dataset = td.dataset;
      [dataset.row, dataset.col] = ['' + row, '' + col];
      return td;
    }
    //---------------------------------------------------------------
    // set current element
    const setCurrent = (elm: HTMLElement) => {
      const crn = 'crn';
      this.crntElm?.classList.remove(crn);
      elm.classList.add(crn);
      this.crntElm = elm;
    }
    //---------------------------------------------------------------
    // exec range function
    const execRange = (fnc: (elm: HTMLElement, eol?: boolean) => void) => {
      let { r1, c1, r2, c2 } = selects;
      if (c2 < 0) {
        if (this.crntElm) {
          let [r, c] = getCellXY(this.crntElm);
          [r1, c1, r2, c2] = [r, c, r, c];
        } else {
          return;
        }
      }
      [r1, r2] = r2 > r1 ? [r1, r2] : [r2, r1];
      [c1, c2] = c2 > c1 ? [c1, c2] : [c2, c1];
      for (let _row = r1; _row <= r2; _row++) {
        for (let _col = c1; _col <= c2; _col++) {
          fnc(cell(_row, _col), _col == c2);
        }
      }
    }

    //---------------------------------------------------------------
    // create : table - tbody - [1st tr:header - th]
    const headTrElm = tbodyElm.appendChild(createElm('tr'));
    headTrElm.appendChild(createTh('', true)); // top&left
    [...Array(maxcol)].forEach((_, i) => {
      headTrElm.appendChild(createTh(num2(i), true)); // top
    });
    //---------------------------------------------------------------
    // create : table - tbody - [tr - td]
    [...Array(maxrow)].forEach((_, i) => {
      const tr = tbodyElm.appendChild(createElm('tr'));
      tr.appendChild(createTh(num2(i), false));
      [...Array(maxcol)].forEach((_, j) => {
        tr.appendChild(createTd(i + 1, j + 1));
      });
    });

    //---------------------------------------------------------------
    // set cell data
    {
      const data = this.data || [['']];
      setRangeFirst2(1, 1);
      setRangeLast2(data.length, data[0].length);
      let r = 0, c = 0;
      execRange((elm, eol) => {
        elm.innerText = data[r][c];
        if (eol) c = 0, r++; else c++
      });
    }

    //---------------------------------------------------------------
    // set width
    headTrElm.childNodes.forEach(node => {
      const elm = node as HTMLElement;
      if (elm.tagName == 'TH') { // #comment 除去
        const realStyle = window.getComputedStyle(elm);
        elm.style.width = (elm.clientWidth > 200) ? '200px' : realStyle.width;
      }
    });
    tableElm.style.width = 'fit-content';

    //---------------------------------------------------------------
    // edit blue event
    const editBlue = () => {
      const editElm = this.editElm;
      if (editElm) {
        editElm.removeEventListener('blur', editBlue);
        editElm.removeAttribute('contentEditable');
      }
      this.editElm = null;
    }
    //---------------------------------------------------------------
    // clear selection range
    const clearRange = (clear?: boolean) => {
      execRange((elm) => elm.classList.remove('msel'));
      if (clear) selects = { ...nosels };
    }
    //---------------------------------------------------------------
    // clear selection range
    const drawRange = () => execRange((elm) => elm.classList.add('msel'));

    //---------------------------------------------------------------
    // mouse down event
    tableElm.addEventListener('mousedown', e => {
      let td = e.target as HTMLTableCellElement;
      if (e.detail == 1) {
        clearRange();
        if (td.tagName == 'TH') {
          // 1st click header:th or row top:th element
          const thColIx = (td as HTMLTableCellElement).cellIndex;
          const thRowIx = (td.parentElement as HTMLTableRowElement).rowIndex;
          const isHead = (thRowIx == 0);
          selects = (isHead)
            ? { r1: 1, c1: thColIx, r2: maxrow, c2: thColIx }
            : { r1: thRowIx, c1: 1, r2: thRowIx, c2: maxcol };
          mousemv = (isHead) ? 2 : 3;
        } else {
          // 1st click => change current
          setCurrent(td);
          setRangeFirst(td);
          mousemv = 1;
        }
      } if (e.detail == 2) {
        if (td.tagName == 'TH') {
          // duble click => widen cell
          clearRange();
          widen(td);
          drawRange();
        } else {
          // duble click => change edit mode
          td.contentEditable = 'true';
          td.addEventListener('blur', editBlue);
          this.editElm = td;
        }
      }
    });
    //---------------------------------------------------------------
    // mouse move event
    tableElm.addEventListener('mousemove', e => {
      if (mousemv == 0) return;
      const td = e.target as HTMLElement;
      let [r, c] = getCellXY(td);
      if (mousemv == 1 && selects.r2 == r && selects.c2 == c) return;
      if (mousemv == 2) r = selects.r2;
      if (mousemv == 3) c = selects.c2;
      clearRange();
      [selects.r2, selects.c2] = [r, c];
      drawRange();
    });
    //---------------------------------------------------------------
    // mouse leave event
    tableElm.addEventListener('mouseleave', e => {
      if (mousemv == 0) return;
      clearRange(true);
      mousemv = 0;
    });
    //---------------------------------------------------------------
    // mouse up event
    tableElm.addEventListener('mouseup', e => {
      const td = e.target as HTMLElement;
      const [r, c] = getCellXY(td);
      if (mousemv == 1 && selects.r1 == r && selects.c1 == c) {
        clearRange(true);
      }
      if (mousemv == 2 && selects.c1 == c) drawRange();
      if (mousemv == 3 && selects.r1 == r) drawRange();
      mousemv = 0;
      this.crntElm?.focus();
    });

    //---------------------------------------------------------------
    // keypress event
    tableElm.addEventListener('keypress', e => {
      const td = e.target as HTMLTableCellElement;
      if (!this.editElm) {
        toEdit(td);
      }
    });
    //---------------------------------------------------------------
    // key down event
    tableElm.addEventListener('keydown', e => {
      const thisCell = e.target as HTMLTableCellElement;
      const thisRow = thisCell.parentElement as HTMLTableRowElement;
      const thisRowIx: number = thisRow.rowIndex;
      const thisColIx: number = thisCell.cellIndex;
      const rowFirstIx = 1;
      const rowLastIx = maxrow;
      const colFirstIx = 1;
      const colLastIx = maxcol;
      //-------------------------------------------------------------
      const arrow = (b1: boolean, opt: ScrollToOptions, rowix: number, colix: number): HTMLTableCellElement => {
        const td = cell(rowix, colix);
        if (b1) scrollElm.scroll(opt);
        td.blur();
        td.focus();
        setCurrent(td);
        e.preventDefault();
        return td;
      }
      //-------------------------------------------------------------
      const updown = (up: boolean): HTMLTableCellElement => {
        let rowFroLIx, scroll, rowIx;
        if (up) {
          [rowFroLIx, scroll, rowIx] = [rowFirstIx, 0, thisRowIx - ((thisRowIx > rowFirstIx) ? 1 : 0)];
        } else {
          [rowFroLIx, scroll, rowIx] = [rowLastIx, 9999, thisRowIx + ((thisRowIx < rowLastIx) ? 1 : 0)];
        }
        return arrow(rowFroLIx == rowIx, { top: scroll }, rowIx, thisColIx)
      }
      //-------------------------------------------------------------
      const leftright = (left: boolean): HTMLTableCellElement => {
        let colFroLIx, scroll, colIx;
        if (left) {
          [colFroLIx, scroll, colIx] = [colFirstIx, 0, thisColIx + ((thisColIx > colFirstIx) ? -1 : 0)];
        } else {
          [colFroLIx, scroll, colIx] = [colLastIx, 9999, thisColIx + ((thisColIx < colLastIx) ? 1 : 0)];
        }
        return arrow(colFroLIx == colIx, { left: scroll }, thisRowIx, colIx)
      }
      //-------------------------------------------------------------
      const arrowmove = (isShift: boolean, movefunc: (dir: boolean) => HTMLTableCellElement, dir: boolean) => {
        if (isShift) {
          clearRange();
          if (selects.c1 < 0) {
            setRangeFirst(thisCell);
          }
          const _td = movefunc(dir);
          setRangeLast(_td);
          drawRange();
        } else {
          clearRange(true);
          movefunc(dir);
        }
      }
      //-------------------------------------------------------------
      const getTexts = (): string => {
        let v = '';
        if (selects.c2 >= 0) {
          execRange((elm, eol) => v += elm.innerText + ((eol) ? '\r\n' : '\t'));
        } else if (this.crntElm) {
          v = this.crntElm.innerText;
        }
        return v;
      }
      //-------------------------------------------------------------
      const setTexts = (v: string): void => {
        const crntElm = this.crntElm;
        if (!crntElm) return;
        const [r, c] = getCellXY(crntElm);
        clearRange();
        setRangeFirst2(r, c);
        const rows = v.split('\r\n');
        const rowmax = rows.length - ((rows[rows.length - 1] == '') ? 1 : 0);
        let cols = rows.shift()?.split('\t');
        const colmax = cols!.length;
        setRangeLast2(r + rowmax - 1, c + colmax - 1);
        execRange((elm, eol) => {
          const v = cols?.shift();
          if (v != undefined) elm.innerText = v;
          if (eol) cols = rows.shift()?.split('\t');
          elm.classList.add('msel')
        });
      }
      //-------------------------------------------------------------
      if (this.editElm) {
        switch (e.key) {
          case 'Tab':
            leftright(e.shiftKey);
            break;
          case 'Enter':
            updown(e.shiftKey);
            break;
          case 'Escape':
            thisCell.innerText = beforeValue;
            thisCell.blur();
            thisCell.focus();
            e.preventDefault();
            break;
          default:
            break;
        }
      } else {
        switch (e.key) {
          case 'ArrowDown':
            arrowmove(e.shiftKey, updown, false);
            break;
          case 'ArrowUp':
            arrowmove(e.shiftKey, updown, true);
            break;
          case 'ArrowRight':
            arrowmove(e.shiftKey, leftright, false);
            break;
          case 'ArrowLeft':
            arrowmove(e.shiftKey, leftright, true);
            break;
          case 'Tab':
            leftright(e.shiftKey); // todo:範囲移動
            break;
          case 'Enter':
            updown(e.shiftKey);  // todo:範囲移動
            break;
          case 'F2':
            toEdit(thisCell);
            e.preventDefault();
            break;
          case 'Backspace':
            toEdit(thisCell);
            thisCell.innerText = '';
            e.preventDefault();
            break;
          case 'Delete':
            if (e.shiftKey) {
              // cut
              navigator.clipboard.writeText(getTexts());
            }
            execRange((elm) => elm.innerText = '');
            e.preventDefault();
            break;
          case 'x':
            if (e.ctrlKey) {
              // cut
              navigator.clipboard.writeText(getTexts());
              execRange((elm) => elm.innerText = '');
              e.preventDefault();
            }
            break;
          case 'c':
          case 'Insert':
            if (e.ctrlKey) {
              // copy
              navigator.clipboard.writeText(getTexts());
            }
            break;
          case 'v':
            if (e.ctrlKey) {
              // paste
              navigator.clipboard.readText().then(tx => setTexts(tx));
            }
            break;
          case 'Insert':
            if (e.shiftKey) {
              // paste
              navigator.clipboard.readText().then(tx => setTexts(tx));
            }
            break;
          case 'z':
          case 'Z':
            if (e.ctrlKey) {
              if (e.shiftKey) {
                // redo: Ctrl+Shift+z
                console.log('Ctrl+Shift+z');
              } else {
                // undo: Ctrl+z
                console.log('Ctrl+z');
              }
              e.preventDefault();
            }
            break;
          case 'y':
            if (e.ctrlKey) {
              // redo: Ctrl+y
              console.log('Ctrl+y');
              e.preventDefault();
            }
            break;
        }
      }
    });

    //---------------------------------------------------------------
    // 
    let beforeValue: string;
    //---------------------------------------------------------------
    // 
    const toEdit = (td: HTMLTableCellElement) => {
      td.contentEditable = 'true';
      beforeValue = td.innerText;
      const [sel, rng] = [window.getSelection(), document.createRange()];
      rng.selectNodeContents(td);
      sel?.removeAllRanges()
      sel?.addRange(rng)
      td.addEventListener('blur', editBlue);
      this.editElm = td;
    }
    //---------------------------------------------------------------
    // 
    const widen = (thElm: HTMLTableCellElement) => {
      const scrollLeft = scrollElm.scrollLeft; // スクロール状態を保持
      const cntnrRect = scrollElm.firstElementChild!.getBoundingClientRect();
      const cellElms = tableElm.querySelectorAll(`tbody tr td:nth-child(${thElm.cellIndex + 1})`);
      if (cellElms.length <= 0) return;
      // padding, margin サイズを求める
      const realStyle = window.getComputedStyle(cellElms.item(0));
      const padSize = ''
        + `${realStyle.paddingLeft} + ${realStyle.paddingRight} + `
        + `${realStyle.marginLeft} + ${realStyle.marginRight}`;
      thElm.style.width = '4em';// 一時的にセルのサイズを縮める
      // 全ての行をチェックし最大widthを求める (tbody > tr > td)
      let maxWidth = Array.from(cellElms).reduce((a, b) => a.scrollWidth > b.scrollWidth ? a : b).scrollWidth;
      thElm.style.width = `calc(${Math.min(maxWidth, (cntnrRect.width * .7))}px + ${padSize})`;
      scrollElm.scrollLeft = scrollLeft; // スクロール状態を回復
    }
  }

  /**
   * セルの文字列を取得する
   * @param row 取得する行数
   * @param col 取得する列数
   * @param fnc 取得用コールバック関数
   */
  public getCells(row: number, col: number, fnc: (row: number, col: number, val: string, eol: boolean) => void) {
    const tableElm = this.thisElm.firstElementChild as HTMLElement;
    const tbodyElm = tableElm.firstElementChild as HTMLElement;
    for (let _row = 1; _row <= row; _row++) {
      for (let _col = 1; _col <= col; _col++) {
        const td = tbodyElm.children[_row].children[_col] as HTMLTableCellElement;
        fnc(_row, _col, td.innerText, col == _col);
      }
    }
  }
}