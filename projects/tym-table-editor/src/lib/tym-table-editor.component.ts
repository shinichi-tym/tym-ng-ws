/*!
 * tym-table-editor.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, AfterViewInit, ElementRef, Renderer2, Input } from '@angular/core';

const num2 = (n: number) => ('00' + (n + 1)).slice(-2);
type HIST = { r: number, c: number, b: string, a: string };
type HISTS = [HIST];
export type TYM_EDITOR_DEF = {
  /** 対象列番号(1～) */
  col: number;
  /** 対象例タイプ */
  type?: string;
  /** 対象列揃え指定 {'left' | 'center' | 'right'} */
  align?: 'left' | 'center' | 'right';
  /** 値を表示文字に変換する関数 */
  viewfnc?: (val: string, type?: string, col?: number) => string;
  /** 値を編集する関数 *`please wait...`* */
  editfnc?: (elm: HTMLElement, val: string, type?: string, col?: number) => Promise<string>;
}

@Component({
  selector: 'ngx-tym-table-editor',
  template: '<table><tbody></tbody></table>',
  styleUrls: ['./tym-table-editor.component.scss']
})
export class TymTableEditorComponent implements AfterViewInit {

  private thisElm: HTMLElement; // this table element
  private editElm: HTMLElement | null = null; // edited td cell
  private crntElm: HTMLElement | null = null; // current td cell

  private history: HISTS[] = [];
  private history_pos: number = -1;
  private history_dwn: boolean = false;

  @Input() row: number = 30;
  @Input() col: number = 20;
  @Input() defs: TYM_EDITOR_DEF[] = [];
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
    const thisElm = this.thisElm;
    const tableElm = thisElm.firstElementChild as HTMLElement;
    const tbodyElm = tableElm.firstElementChild as HTMLElement;
    //---------------------------------------------------------------
    // ..
    const maxrow = this.row;
    const maxcol = this.col;
    const nosels = { r1: -1, c1: -1, r2: -1, c2: -1 };
    const viewfncs = new Map<number, (val: string) => string>();
    const editfncs = new Map<number, (elm: HTMLElement, val: string) => Promise<string>>();
    /**  0:not move, 1:cell, 2:col, 3:row */
    let mousemv: number = 0;
    let selects: { r1: number, c1: number, r2: number, c2: number } = { ...nosels };
    //---------------------------------------------------------------
    // ..
    const { overflowX, overflowY } = window.getComputedStyle(thisElm);
    const scrollElm = (!(overflowX == 'auto' || overflowX == 'scroll' || overflowY == 'auto' || overflowY == 'scroll'))
      ? thisElm.parentElement as HTMLElement : thisElm;
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
    // 表示に変換してセルに設定(変換ありの場合は実値をdataset-valに保存)
    const setText = (elm: HTMLElement, col: number, val: string) => {
      const viewfnc = viewfncs.get(col);
      if (viewfnc) {
        elm.dataset.val = val;
        elm.innerText = viewfnc(val);
      } else {
        elm.innerText = val;
      }
    }
    //---------------------------------------------------------------
    // 実値を取得(変換ありの場合はdataset-valから取得)
    const text = (elm: HTMLElement): string =>
      (elm.dataset.val) ? elm.dataset.val : elm.innerText;

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
    // ..
    if (this.defs.length >= 0) {
      let styleElm: HTMLElement;
      this.defs.forEach((def, idx) => {
        if (def.align) {
          if (!styleElm) {
            styleElm = createElm('style');
            thisElm.append(styleElm);
          }
          styleElm.innerText += `td:nth-child(${def.col + 1}){text-align:${def.align};}`;
        }
        if (def.viewfnc) {
          viewfncs.set(def.col, (val: string) => def.viewfnc!(val, def.type, def.col))
        }
        if (def.editfnc) {
          editfncs.set(def.col, (elm: HTMLElement, val: string) => def.editfnc!(elm, val, def.type, def.col))
        }
      });
    }

    //---------------------------------------------------------------
    // set cell data
    {
      const data = this.data || [['']];
      setRangeFirst2(1, 1);
      setRangeLast2(data.length, data[0].length);
      let r = 0, c = 0;
      execRange((elm, eol) => {
        setText(elm, c + 1, data[r][c] || '');
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
          setCurrent(cell(selects.r1,selects.c1));
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
          toEdit(td);
          e.preventDefault();
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
      const rangeAll = { r1: 1, c1: 1, r2: maxrow, c2: maxcol };
      //-------------------------------------------------------------
      /** 矢印によるフォーカスの移動                                 */
      const arrow = (opt: ScrollToOptions, rowix: number, colix: number): HTMLTableCellElement => {
        const td = cell(rowix, colix);
        if (opt != {}) scrollElm.scroll(opt);
        td.blur();
        td.focus();
        setCurrent(td);
        e.preventDefault();
        return td;
      }
      //-------------------------------------------------------------
      /** 上下左右端用のスクロール指示情報取得                       */
      const getScroll = (row: number, col: number) => {
        let scroll: { left?: number, top?: number } = {}
        const { r1, c1, r2, c2 } = rangeAll;
        if (col == c1) scroll.left = 0;
        if (col == c2) scroll.left = 9999;
        if (row == r1) scroll.top = 0;
        if (row == r2) scroll.top = 9999;
        return scroll;
      }
      //-------------------------------------------------------------
      /** 矢印によるフォーカスの上下移動                             */
      const updown = (up: boolean, range: boolean = false): HTMLTableCellElement => {
        const b = (range && selects.c2 >= 0);
        const r = b ? selects : rangeAll;
        let colIx = thisColIx, rowIx = thisRowIx;
        if (up) {
          if (rowIx > r.r1) {
            rowIx--;
          } else {
            if (b) {
              rowIx = r.r2;
              colIx = (colIx > r.c1) ? colIx - 1 : r.c2;
            }
          }
        } else {
          if (rowIx < r.r2) {
            rowIx++;
          } else {
            if (b) {
              rowIx = r.r1;
              colIx = (colIx < r.c2) ? colIx + 1 : r.c1;
            }
          }
        }
        return arrow(getScroll(rowIx, colIx), rowIx, colIx);
      }
      //-------------------------------------------------------------
      /** 矢印によるフォーカスの左右移動                             */
      const leftright = (left: boolean, range: boolean = false): HTMLTableCellElement => {
        const b = (range && selects.c2 >= 0);
        const r = b ? selects : rangeAll;
        let colIx = thisColIx, rowIx = thisRowIx;
        if (left) {
          if (colIx > r.c1) {
            colIx--;
          } else {
            if (b) {
              colIx = r.c2;
              rowIx = (rowIx > r.r1) ? rowIx - 1 : r.r2;
            }
          }
        } else {
          if (colIx < r.c2) {
            colIx++;
          } else {
            if (b) {
              colIx = r.c1;
              rowIx = (rowIx < r.r2) ? rowIx + 1 : r.r1;
            }
          }
        }
        return arrow(getScroll(rowIx, colIx), rowIx, colIx)
      }
      //-------------------------------------------------------------
      /** 矢印によるフォーカスの移動                                 */
      const arrowmove = (isShift: boolean, movefunc: (dir: boolean, range?: boolean) => HTMLTableCellElement, dir: boolean) => {
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
      /** クリップボードへの(\r\n,/\t区切りテキストの)設定           */
      const getTexts = (): string => {
        let v = '';
        if (selects.c2 >= 0) {
          execRange((elm, eol) => v += text(elm) + ((eol) ? '\r\n' : '\t'));
        } else if (this.crntElm) {
          v = text(this.crntElm);
        }
        return v;
      }
      //-------------------------------------------------------------
      /** クリップボードからの(\r\n,/\t区切りテキストの)貼り付け      */
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
        let hists: any = [];
        execRange((elm, eol) => {
          const v = cols?.shift();
          if (v != undefined) {
            const [r, c] = getCellXY(elm);
            hists.push({ r: r, c: c, b: text(elm), a: v });
            setText(elm, c, v);
          }
          if (eol) cols = rows.shift()?.split('\t');
          elm.classList.add('msel')
        });
        // 編集履歴に追加
        addhists(hists);
      }
      //-------------------------------------------------------------
      /** 選択範囲を消す                                            */
      const clearTexts = (): void => {
        let hists: any = [];
        execRange(elm => {
          const [r, c] = getCellXY(elm);
          hists.push({ r: r, c: c, b: text(elm), a: '' });
          setText(elm, c, '');
        });
        // 編集履歴に追加
        addhists(hists);
      }
      //-------------------------------------------------------------
      // 編集モード時のキー処理
      if (this.editElm) {
        switch (e.key) {
          case 'Tab':
            leftright(e.shiftKey, true);
            break;
          case 'Enter':
            updown(e.shiftKey, true);
            break;
          case 'Escape':
            setText(thisCell, thisColIx, beforeValue || '');
            thisCell.blur();
            thisCell.focus();
            e.preventDefault();
            break;
          default:
            break;
        }
      }
      //-------------------------------------------------------------
      // 表示モード時のキー処理
      else
      {
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
            leftright(e.shiftKey, true);
            break;
          case 'Enter':
            updown(e.shiftKey, true);
            break;
          case 'F2':
            toEdit(thisCell);
            e.preventDefault();
            break;
          case 'Backspace':
            const newtd = toEdit(thisCell);
            setText(newtd, thisColIx, '');
            e.preventDefault();
            break;
          case 'Delete':
            if (e.shiftKey) {
              // cut
              navigator.clipboard.writeText(getTexts());
            }
            clearTexts();
            e.preventDefault();
            break;
          case 'x':
            if (e.ctrlKey) {
              // cut
              navigator.clipboard.writeText(getTexts());
              clearTexts();
              e.preventDefault();
            }
            break;
          case 'c':
          case 'Insert':
            if (e.ctrlKey) {
              // copy
              navigator.clipboard.writeText(getTexts());
              e.preventDefault();
            }
            break;
          case 'v':
            if (e.ctrlKey) {
              // paste
              navigator.clipboard.readText().then(tx => setTexts(tx));
              e.preventDefault();
            }
            break;
          case 'Insert':
            if (e.shiftKey) {
              // paste
              navigator.clipboard.readText().then(tx => setTexts(tx));
              e.preventDefault();
            }
            break;
          case 'z':
          case 'Z':
            if (e.ctrlKey) {
              // true(redo: Ctrl+Shift+z), false(undo: Ctrl+z)
              undoredo(e.shiftKey);
              e.preventDefault();
            }
            break;
          case 'y':
            if (e.ctrlKey) {
              // redo: Ctrl+y
              undoredo(true);
              e.preventDefault();
            }
            break;
        }
      }
    });

    /****************************************************************
     * Escapeキー戻値用
     */
    let beforeValue: string|null;

    /****************************************************************
     * フォーカスアウトイベント処理，表示モードにする
     */
    const editBlue = () => {
      const editElm = this.editElm;
      if (editElm) {
        const thisValue = text(editElm);
        editElm.removeEventListener('blur', editBlue);
        editElm.removeAttribute('contentEditable');
        const [r, c] = getCellXY(editElm);
        setText(editElm, c, thisValue);
        if (thisValue != beforeValue && beforeValue != null) {
          const hist = { r: r, c: c, b: beforeValue, a: thisValue };
          addhists([hist]);
        }
      }
      beforeValue = null;
      this.editElm = null;
    }

    /****************************************************************
     * 対象セルを編集モードにする
     * @param td 対象エレメント
     */
    const toEdit = (td: HTMLTableCellElement) => {
      const [r, c] = getCellXY(td);
      const editfnc = editfncs.get(c);
      beforeValue = text(td);
      if (editfnc) {
        // 編集機能あり
        editfnc(td, beforeValue).then(v => {
          setText(td, c, v);
          addhists([{ r: r, c: c, b: beforeValue!, a: v }]);
        });
        return td;
      } else {
        // 編集機能なし
        td.innerText = beforeValue;
        td.contentEditable = 'true';
        const newtd = td.parentElement?.insertBefore(td.cloneNode(true), td) as HTMLElement;
        setCurrent(newtd);
        newtd.addEventListener('blur', editBlue);
        const [sel, rng] = [window.getSelection(), document.createRange()];
        rng.selectNodeContents(newtd);
        sel?.removeAllRanges();
        sel?.addRange(rng)
        td.remove();
        this.editElm = newtd;
        return newtd;
      }
    }

    /****************************************************************
     * 編集履歴：履歴追加
     * @param hists 履歴情報
     */
    const addhists = (hists: HISTS) => {
      if (this.history.length - 1 == this.history_pos) {
        this.history.push(hists);
        this.history_pos++;
      } else {
        this.history.splice(this.history_pos, 99999, hists);
      }
      this.history_dwn = true;
    }

    /****************************************************************
     * 編集履歴：アンドゥ＆リドゥ処理
     * @param redo true:リドゥ, false:アンドゥ
     */
    const undoredo = (redo: boolean) => {
      let pos = this.history_pos;
      if (redo != this.history_dwn) {
        this.history_dwn = redo;
      } else {
        pos += (redo ? this.history.length - 1 > pos : pos > 0) ? (redo ? 1 : -1) : 0;
      }
      const hist = this.history[pos];
      this.history_pos = pos;
      hist?.forEach(v => {
        setText(cell(v.r, v.c), v.c, (redo) ? v.a : v.b);
      });
      const [v1, v2] = [hist![0], hist![hist!.length - 1]];
      const td = cell(v1.r, v1.c);
      clearRange();
      if (hist!.length > 1) {
        setRangeFirst2(v1.r, v1.c);
        setRangeLast2(v2.r, v2.c);
        drawRange();
      }
      td.focus();
      setCurrent(td);
    }

    /****************************************************************
     * カラムリサイズ
     * @param thElm 対象エレメント
     */
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

  //-----------------------------------------------------------------
  // 公開関数
  //-----------------------------------------------------------------

  /******************************************************************
   * セルの文字列を取得する
   * @param rownum 取得する行数
   * @param colnum 取得する列数
   * @param fnc 取得用コールバック関数
   */
  public getCells(rownum: number, colnum: number, fnc: (row: number, col: number, val: string, eol: boolean) => void) {
    const tableElm = this.thisElm.firstElementChild as HTMLElement;
    const tbodyElm = tableElm.firstElementChild as HTMLElement;
    for (let _row = 1; _row <= rownum; _row++) {
      for (let _col = 1; _col <= colnum; _col++) {
        const td = tbodyElm.children[_row].children[_col] as HTMLTableCellElement;
        fnc(_row, _col, td.innerText, colnum == _col);
      }
    }
  }
}