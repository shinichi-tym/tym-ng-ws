/*!
 * tym-table-editor.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, AfterViewInit, ElementRef, Renderer2, Input, HostBinding } from '@angular/core';

const AUTO = 'auto';
const SCROLL = 'scroll';

const num2 = (n: number) => ('00' + n).slice(-2);
const FIRST_ELEMENT_CHILD = (elm: HTMLElement) => elm?.firstElementChild as HTMLElement;
type HIST = { r: number, c: number, b: string, a: string, d?: TYM_EDITOR_DEF };
type HISTS = HIST[];
type RANGE = { r1: number, c1: number, r2: number, c2: number };
/** カラム定義 */
export type TYM_EDITOR_DEF = {
  /** 対象列番号(1～) */
  col: number;
  /** 対象列タイプ */
  type?: string;
  /** 対象列揃え指定 {'left' | 'center' | 'right'}, 規定値: 'left' */
  align?: 'left' | 'center' | 'right';
  /** 表示モードだけにする, 規定値: false */
  readonly?: boolean;
  /** 値を表示文字に変換する関数, 規定値: なし */
  viewfnc?: (val: string, type?: string, col?: number) => string;
  /** 値を編集する関数, 規定値: なし */
  editfnc?: (elm: HTMLElement, val: string, type?: string, col?: number) => Promise<string | null>;
}
/** オプション定義 */
export type TYM_EDITOR_OPTS = {
  /** 選択, カレントセルを折り返ししない */
  whiteSpaceNoWrap?: boolean;
  /** 編集モードの解除時に列のリサイズを実行する */
  editModeAutoResize?: boolean;
  /** フラットデザインにする */
  flatDesign?: boolean;
  /** 垂直方向のリサイズを無しにする */
  noVerticalResize?: boolean;
}

@Component({
  selector: 'ngx-tym-table-editor',
  template: '<table><tbody></tbody></table>',
  styleUrls: ['./tym-table-editor.component.scss']
})
export class TymTableEditorComponent implements AfterViewInit {

  private static idnum = 0;
  private _thisElm: HTMLElement; // this table element

  @Input() row: number = 30;
  @Input() col: number = 20;
  @Input() defs: TYM_EDITOR_DEF[] = [];
  @Input() data: any[][] = [['']];
  @Input() menu = (event: MouseEvent, row1: number, col1: number, row2: number, col2: number) => false;
  private _opts: TYM_EDITOR_OPTS = {}
  @Input() set opts(opts: TYM_EDITOR_OPTS) {
    this._opts = opts;
    this._setopt();
  }
  private _setopt() {
    const tableElm = FIRST_ELEMENT_CHILD(this._thisElm);
    const tbodyElm = FIRST_ELEMENT_CHILD(tableElm);
    setTimeout(() => {
      if (tbodyElm) {
        const [cl, opts] = [tbodyElm.classList, this._opts];
        if (opts.whiteSpaceNoWrap) { cl.add('nowrap'); } else { cl.remove('nowrap'); }
        if (opts.noVerticalResize) { cl.add('novrsz'); } else { cl.remove('novrsz'); }
      }
    });
    [this.thFont, this.thWidth, this.thBgColor, this.thBorder, this.thWidth1, this.thWidth2, this.tdShadow]
      = (this._opts.flatDesign)
        ? ['700 9pt/12pt system-ui', '1.40em', '#eee', 'solid 1px #666', '1px 1px 1px 0', '0 1px 1px 1px', 'none']
        : ['700 8pt/10pt system-ui', '1.25em', '#ccc', 'outset 2px #eee', '2px', '2px', '.5px .5px 0px #000 inset'];
  }

  /** Host Binding style */
  @HostBinding('style.--th-fo') protected thFont!: string; //700 8pt/10pt system-ui / 700 9pt/12pt system-ui
  @HostBinding('style.--th-wd') protected thWidth!: string; //1.25em / 1.40em
  @HostBinding('style.--th-bc') protected thBgColor!: string; //#ccc / #eee
  @HostBinding('style.--th-bo') protected thBorder!: string; //outset 2px #eee / solid 1px #666
  @HostBinding('style.--th-w1') protected thWidth1!: string; //2px / 0 1px 1px 0
  @HostBinding('style.--th-w2') protected thWidth2!: string; //2px / 0 1px 1px 0
  @HostBinding('style.--td-bs') protected tdShadow!: string; //.5px .5px 0px #000 inset / none

  /**
   * コンストラクタ
   *
   * @memberof TymTreeViewComponent
   */
  constructor(
    private _elmRef: ElementRef,
    private _renderer: Renderer2
  ) {
    this._thisElm = this._elmRef.nativeElement as HTMLElement;
  };

  /**
   * ビューを初期化した後の処理
   */
  public ngAfterViewInit(): void {
    //---------------------------------------------------------------
    // ..
    const thisElm = this._thisElm;
    const tableElm = FIRST_ELEMENT_CHILD(thisElm);
    const tbodyElm = FIRST_ELEMENT_CHILD(tableElm);
    const contentName = '_tymtableeditor-' + TymTableEditorComponent.idnum++;
    tableElm.setAttribute(contentName,'');
    //---------------------------------------------------------------
    // ..
    const maxrow = this.row;
    const maxcol = this.col;
    const nosels = { r1: -1, c1: -1, r2: -1, c2: -1 };
    const editordefs = new Map<number, TYM_EDITOR_DEF>();
    /**  0:not move, 1:cell, 2:col, 3:row */
    let mousemv: number = 0;
    let selects: RANGE = { ...nosels };
    let cpysels: RANGE = { ...nosels };
    //---------------------------------------------------------------
    // ..
    let editElm: HTMLTableCellElement | null = null; // edited td cell
    let crntElm: HTMLTableCellElement | null = null; // current td cell  
    //---------------------------------------------------------------
    // ..
    const { overflowX, overflowY } = window.getComputedStyle(thisElm);
    const scrollElm = (!(overflowX == AUTO || overflowX == SCROLL || overflowY == AUTO || overflowY == SCROLL))
      ? thisElm.parentElement as HTMLElement : thisElm;
    //---------------------------------------------------------------
    // ..
    const cell = (r: number, c: number) => tbodyElm.children[r]?.children[c] as HTMLTableCellElement;
    const crntRange = () => {
      const [r, c] = cellRowCol(crntElm);
      return { r1: r, c1: c, r2: r, c2: c };
    }
    const cellRowCol = (td: HTMLTableCellElement | null) =>
      (td) ? [(td.parentElement as HTMLTableRowElement).rowIndex, td.cellIndex] : [1, 1];
    //---------------------------------------------------------------
    // create element
    const createElm = (name: string) => this._renderer.createElement(name) as HTMLElement;
    //---------------------------------------------------------------
    // create th element
    const createTh = (tx: string) => {
      const th = createElm('th') as HTMLTableCellElement;
      th.innerText = tx;
      return th;
    }
    //---------------------------------------------------------------
    // create td element
    const createTd = () => {
      const td = createElm('td') as HTMLTableCellElement;
      td.tabIndex = -1;
      return td;
    }
    //---------------------------------------------------------------
    // get TYM_EDITOR_DEF
    const _getEditorDef = (th: HTMLTableCellElement) =>
      th.onprogress!(new ProgressEvent('')) as TYM_EDITOR_DEF | undefined;
    const getEditorDef = (td: HTMLTableCellElement) =>
      _getEditorDef(headTrElm.children[td.cellIndex] as HTMLTableCellElement);
    //---------------------------------------------------------------
    // get editFunc
    const getEditFunc = (td: HTMLTableCellElement) => {
      const def = getEditorDef(td);
      return (def?.editfnc)
        ? (td: HTMLTableCellElement, val: string) => def.editfnc!(td, val, def.type)
        : undefined;
    }
    //---------------------------------------------------------------
    // get viewFunc
    const getViewFunc = (td: HTMLTableCellElement) => {
      const def = getEditorDef(td);
      return (def?.viewfnc) ? (val: string) => def.viewfnc!(val, def.type) : undefined;
    }
    //---------------------------------------------------------------
    // get align / background style
    const getDynamicStyle = (td: HTMLTableCellElement) => {
      const def = getEditorDef(td);
      const style = ''
        + ((def?.align) ? `text-align:${def?.align};` : '')
        + ((def?.readonly) ? 'background-color:#f8f8f8;' : '');
      return (style == '') ? '' : `table[${contentName}] td:nth-child(${td.cellIndex + 1}){${style}}`;
    }
    //---------------------------------------------------------------
    // get style texts
    const getStyleText = () =>
      Array.from(headTrElm.children).map(th => getDynamicStyle(th as HTMLTableCellElement)).join('');
    //---------------------------------------------------------------
    // create header th element
    const createRowTh = (col: number, def?: TYM_EDITOR_DEF) => {
      const tx = num2(col);
      const th = createTh(tx);
      th.onprogress = (e: Event) => {
        const _editordef = { ...def }
        return _editordef;
      };
      return th;
    }

    //---------------------------------------------------------------
    // ..
    const classlist = (elm: HTMLElement) => elm.classList;
    const classrm = (elm: HTMLElement, cls: string) => classlist(elm).remove(cls);
    const classadd = (elm: HTMLElement, cls: string) => classlist(elm).add(cls);
    /****************************************************************
     * set current element (crntElm, style)
     * @param elm 対象エレメント
     */
    const setCurrent = (elm: HTMLTableCellElement) => {
      const crn = 'crn';
      if (crntElm) classrm(crntElm, crn);
      classadd(elm, crn);
      crntElm = elm;
    }
    /****************************************************************
     * get select range
     * @param _selects target RANGE
     * @returns { r1: number, c1: number, r2: number, c2: number }
     */
    const range = (_selects: RANGE = selects) => {
      let { r1, c1, r2, c2 } = (_selects.c2 < 0) ? (crntElm) ? crntRange() : nosels : _selects;
      [r1, r2] = r2 > r1 ? [r1, r2] : [r2, r1];
      [c1, c2] = c2 > c1 ? [c1, c2] : [c2, c1];
      return { r1: r1, c1: c1, r2: r2, c2: c2 };
    }
    /****************************************************************
     * exec range function
     * @param fnc call back function
     * @param _selects target RANGE
     */
    const execRange = (fnc: (elm: HTMLTableCellElement, eol?: boolean) => void, _selects: RANGE = selects) => {
      const { r1, c1, r2, c2 } = range(_selects);
      if (c2 < 0) return;
      for (let _row = r1; _row <= r2; _row++) {
        for (let _col = c1; _col <= c2; _col++) {
          fnc(cell(_row, _col), _col == c2);
        }
      }
    }
    //---------------------------------------------------------------
    // set selection range functions
    const checkset = (max: number, n: number) => (-1 > n) ? -1 : (n > max) ? max : n;
    const setSelRange1stRowCol = (r1: number, c1: number) =>
      [selects.r1, selects.c1] = [checkset(maxrow, r1), checkset(maxcol, c1)];
    const setSelRangeLstRowCol = (r2: number, c2: number) =>
      [selects.r2, selects.c2] = [checkset(maxrow, r2), checkset(maxcol, c2)];
    const setSelRange1st = (td: HTMLTableCellElement) => [selects.r1, selects.c1] = cellRowCol(td);
    const setSelRangeLst = (td: HTMLTableCellElement) => [selects.r2, selects.c2] = cellRowCol(td);
    /****************************************************************
     * clear selection range style
     * @param clear true:clear "selects"
     */
    const clearSelRangeStyle = (clear?: boolean) => {
      execRange(elm => classrm(elm, 'msel'));
      if (clear) selects = { ...nosels };
    }
    /****************************************************************
     * set selection range style
     */
    const drawSelRangeStyle = () => execRange(elm => classadd(elm, 'msel'));
    /****************************************************************
     * set converted text to cell (if converted, save to dataset-val)
     * @param elm 対象エレメント
     * @param val 値
     */
    const setText = (elm: HTMLTableCellElement, val: string) => {
      const viewfnc = getViewFunc(elm);
      elm.innerText = (viewfnc) ? viewfnc(elm.dataset.val = val) : val;
    }
    /****************************************************************
     * get real text (if converted, restore from dataset-val)
     * @param elm 対象エレメント
     * @returns 値
     */
    const text = (elm: HTMLTableCellElement): string => elm.dataset.val || elm.innerText;
    /****************************************************************
     * set data to table
     * @param data データ
     */
    const setData2Table = (data: any[][]) => {
      const maxcol = data.reduce((a, b) => a.length > b.length ? a : b);
      setSelRange1stRowCol(1, 1);
      setSelRangeLstRowCol(data.length, maxcol.length);
      let r = 0, c = 0;
      execRange((elm, eol) => {
        const v = data[r][c] || '';
        setText(elm, v);
        if (eol) c = 0, r++; else c++
      });
    };
    /****************************************************************
     * set data to range
     * @param data データ
     * @param row 行番号
     * @param col 列番号
     */
    const setData2Range = (data: any[][], row: number, col: number) => {
      const maxcol = data.reduce((a, b) => a.length > b.length ? a : b);
      clearSelRangeStyle();
      setSelRange1stRowCol(row, col);
      setSelRangeLstRowCol(row + data.length - 1, col + maxcol.length - 1);
      let hists: any = [];
      let r = 0, c = 0;
      execRange((elm, eol) => {
        const v = data[r][c] || '';
        hists.push({ r: row + r, c: col + c, b: text(elm), a: v });
        setText(elm, v);
        classadd(elm, 'msel');
        if (eol) c = 0, r++; else c++
      });
      // 編集履歴に追加
      addhists(hists);
    }
    /****************************************************************
     * set public function (setData)
     */
    this.setData = (data: any[][], row1?: number, col1?: number) => {
      if (row1 && col1) {
        setData2Range(data, row1, col1);
      } else {
        clearAllData();
        setData2Table(data);
      }
    }
    /****************************************************************
     * set public function (getData)
     */
    this.getData = (rownum: number, colnum: number, row?: number, col?: number): any[][] => {
      const [r1, c1, r2, c2] = (row && col) ? [rownum, colnum, row, col] : [1, 1, rownum, colnum];
      let cols: any[] = [];
      let data: any[][] = [];
      for (let _row = r1; _row <= r2; _row++) {
        for (let _col = c1; _col <= c2; _col++) {
          const td = cell(_row, _col);
          cols.push((td) ? td.dataset.val || td.innerText : '');
        }
        data.push(cols);
        cols = [];
      }
      return data;
    }
    //---------------------------------------------------------------
    // renumber row header
    const renumberRow = () => {
      for (let index = 1; index <= maxrow; index++) {
        const tr = tbodyElm.childNodes[index] as HTMLTableRowElement;
        const th = FIRST_ELEMENT_CHILD(tr);
        th.innerText = num2(index);
      }
    }
    //---------------------------------------------------------------
    // renumber col header
    const renumberCol = () => {
      for (let index = 1; index <= maxcol; index++) {
        const th = headTrElm.childNodes[index] as HTMLTableCellElement;
        th.innerText = num2(index);
      }
    }
    //---------------------------------------------------------------
    // create row
    const createrow = (row: number) => {
      const tr = createElm('tr');
      tr.appendChild(createTh(num2(row)));
      for (let index = 1; index <= maxcol; index++) {
        tr.appendChild(createTd())
      }
      return tr;
    }
    //---------------------------------------------------------------
    // view insert / remove row
    const viewInsertRemoveRow = (insRowNum: number, rmRowNum: number) => {
      clearSelRangeStyle(true);
      clearCpyRangeStyle();
      const [insRow, rmRow] = [tbodyElm.childNodes[insRowNum], tbodyElm.childNodes[rmRowNum]];
      tbodyElm.insertBefore(createrow(insRowNum), insRow);
      tbodyElm.removeChild(rmRow!);
      if (crntElm && !crntElm?.isConnected) {
        crntElm = null;
      }
      renumberRow();
    }
    //---------------------------------------------------------------
    // history insert / remove row
    const histInsertRemoveRow = (row: number, rmRowNum: number, ir: string) => {
      const trElm = tbodyElm.childNodes[rmRowNum];
      let hists: any = [{ r: row, c: 0, b: '', a: ir }]; // c:0,a:i/r => insert/remove row
      for (let index = 1; index <= maxcol; index++) {
        const v = text(trElm.childNodes[index] as HTMLTableCellElement);
        if (v != '') hists.push({ r: rmRowNum, c: index, b: v, a: '' });
      }
      addhists(hists);
    }
    //---------------------------------------------------------------
    // insert row
    const insertRow = (row: number) => viewInsertRemoveRow(row, maxrow);
    /****************************************************************
     * set public function (insertRow)
     */
    this.insertRow = (row: number) => {
      histInsertRemoveRow(row, maxrow, 'i');
      insertRow(row);
    }
    //---------------------------------------------------------------
    // remove row
    const removeRow = (row: number) => viewInsertRemoveRow(maxrow + 1, row);
    /****************************************************************
     * set public function (removeRow)
     */
    this.removeRow = (row: number) => {
      histInsertRemoveRow(row, row, 'r');
      removeRow(row);
    }
    //---------------------------------------------------------------
    // view insert / remove col
    const viewInsertRemoveCol = (insColNum: number, rmColNum: number, def?: TYM_EDITOR_DEF) => {
      clearSelRangeStyle(true);
      clearCpyRangeStyle();
      const [insHeadCol, rmHeadCol] = [headTrElm.childNodes[insColNum], headTrElm.childNodes[rmColNum]];
      headTrElm.insertBefore(createRowTh(insColNum, def), insHeadCol);
      headTrElm.removeChild(rmHeadCol!);
      for (let index = 1; index <= maxrow; index++) {
        const tr = tbodyElm.childNodes[index] as HTMLTableRowElement;
        const [insCol, rmCol] = [tr.childNodes[insColNum], tr.childNodes[rmColNum]];
        tr.insertBefore(createTd(), insCol);
        tr.removeChild(rmCol!);
      }
      if (crntElm && !crntElm?.isConnected) {
        crntElm = null;
      }
      styleElement.innerText = getStyleText();
      renumberCol();
    }
    //---------------------------------------------------------------
    // history insert col
    const histInsertRemoveCol = (col: number, rmColNum: number, ir: string) => {
      const th = headTrElm.children[col] as HTMLTableCellElement;
      const def = _getEditorDef(th);
      let hists: any = [{ r: 0, c: col, b: '', a: ir, d: def }]; // r:0,a:i/r => insert/remove col
      for (let index = 1; index <= maxrow; index++) {
        const tr = tbodyElm.childNodes[index] as HTMLTableRowElement;
        const v = text(tr.childNodes[rmColNum] as HTMLTableCellElement);
        if (v != '') hists.push({ r: index, c: rmColNum, b: v, a: '' });
      }
      addhists(hists);
    }
    //---------------------------------------------------------------
    // insert col
    const insertCol = (col: number, def?: TYM_EDITOR_DEF) => viewInsertRemoveCol(col, maxcol, def);
    //---------------------------------------------------------------
    // remove col
    const removeCol = (col: number) => viewInsertRemoveCol(maxcol + 1, col);
    /****************************************************************
     * set public function (insertCol)
     */
    this.insertCol = (col: number, def?: TYM_EDITOR_DEF) => {
      histInsertRemoveCol(col, maxcol, 'i');
      insertCol(col, def);
    }
    /****************************************************************
     * set public function (removeCol)
     */
    this.removeCol = (col: number) => {
      histInsertRemoveCol(col, col, 'r');
      removeCol(col);
    }
    /****************************************************************
     * set public function (copy)
     */
    this.copy = () => elm2clipboard();
    /****************************************************************
     * set public function (paste)
     */
    this.paste = () => clipboard2elm();
    /****************************************************************
     * set public function (delete)
     */
    this.delete = () => deleteTexts();
    /****************************************************************
     * set public function (undo)
     */
    this.undo = () => {
      undoredo(false);
    }
    /****************************************************************
     * set public function (redo)
     */
    this.redo = () => {
      undoredo(true);
    }

    /****************************************************************
     * clear all data in table (history, select range/style, copy range/style)
     */
    const clearAllData = () => {
      tbodyElm.childNodes.forEach(tr => {
        const _tr = tr as HTMLTableRowElement;
        if (_tr.rowIndex > 0) tr.childNodes.forEach(cell => {
          const td = cell as HTMLTableCellElement;
          if (td.cellIndex > 0) setText(td, '');
        });
      });
      clearSelRangeStyle(true);
      clearCpyRangeStyle();
      clearHistory();
    }
    //---------------------------------------------------------------
    // clipboard data
    const clipboard = navigator.clipboard;
    let clipdata: string;
    let copydat: any[][] = [];
    /****************************************************************
     * clear copy range / style
     */
    const clearCpyRangeStyle = () => {
      execRange(elm => classrm(elm, 'cpy'), cpysels);
      cpysels = { ...nosels };
    }
    /****************************************************************
     * set copy range / style
     * @param range 
     */
    const setCpyRangeStyle = (range: RANGE) => {
      cpysels = range;
      execRange(elm => classadd(elm, 'cpy'), cpysels);
    }
    /****************************************************************
     * clear copy data (clear clipboard data)
     */
    const clearCpyData = async () => {
      copydat = [];
      try {
        await clipboard.writeText('');
      } catch (err) {
        console.error('failed to writeText: ', err);
      }
    }
    /****************************************************************
     * クリップボードからの(\r\n,/\t区切りテキストの)貼り付け (use copydat)
     */
    const clipboard2elm = async () => {
      if (!crntElm) return;
      let data: any[][] = [];
      try {
        const text = await clipboard.readText();
        if (clipdata != text) {
          clearCpyRangeStyle();
        }
        const rows = text.split('\r\n');
        rows.forEach(row => data.push(row.split('\t')));
      } catch (err) {
        console.error('failed to readText: ', err);
        data = copydat;
      }
      const [r, c] = cellRowCol(crntElm);
      setData2Range(data, r, c);
    }
    /****************************************************************
     * クリップボードへの(\r\n,/\t区切りテキストの)設定 (set copydat)
     */
    const elm2clipboard = async () => {
      clearCpyRangeStyle();
      let cols: any[] = [];
      copydat = [];
      execRange((elm, eol) => {
        cols.push(text(elm));
        if (eol) {
          copydat.push(cols);
          cols = [];
        }
      });
      let rows: any[] = [];
      copydat.forEach(cols => rows.push(cols.join('\t')));
      setCpyRangeStyle((selects.c2 >= 0) ? { ...selects } : crntRange());
      try {
        clipdata = rows.join('\r\n');
        await clipboard.writeText(rows.join('\r\n'));
      } catch (err) {
        console.error('failed to writeText: ', err);
      }
    }
    /****************************************************************
     * 選択範囲を消す
     */
    const deleteTexts = (): void => {
      let hists: any = [];
      execRange(elm => {
        const [r, c] = cellRowCol(elm);
        hists.push({ r: r, c: c, b: text(elm), a: '' });
        setText(elm, '');
      });
      // 編集履歴に追加
      addhists(hists);
    }

    //---------------------------------------------------------------
    // prepare def(TYM_EDITOR_DEF) data
    this.defs.forEach(def => editordefs.set(def.col, def));

    //---------------------------------------------------------------
    // create : table - tbody - [1st tr:header - th]
    const headTrElm = tbodyElm.appendChild(createElm('tr'));
    {
      headTrElm.appendChild(createTh('')); // top&left
      (headTrElm.lastElementChild as HTMLElement).onprogress = () => { };
      for (let index = 1; index <= maxcol; index++) {
        headTrElm.appendChild(createRowTh(index, editordefs.get(index))); // top
      }
    }

    //---------------------------------------------------------------
    // create : table - tbody - [tr - td]
    {
      for (let index = 1; index <= maxrow; index++) {
        tbodyElm.appendChild(createrow(index));
      }
    }

    //---------------------------------------------------------------
    // create : style
    const styleElement = createElm('style');
    thisElm.append(styleElement);
    styleElement.innerText = styleElement.innerText = getStyleText();

    //---------------------------------------------------------------
    // set cell data
    setData2Table(this.data || [['']]);

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
    // set 1st cell
    clearSelRangeStyle();
    setCurrent(cell(1, 1));

    /****************************************************************
     * mouse down event
     * @param e MouseEvent
     */
    const event_mousedown = (e: MouseEvent) => {
      let td = e.target as HTMLTableCellElement;
      if (e.button == 2) {
        const { r1, c1, r2, c2 } = range();
        const [r, c] = cellRowCol(td);
        if (r1 <= r && r <= r2 && c1 <= c && c <= c2) return;
      }
      if (e.detail == 1) {
        clearSelRangeStyle();
        if (td.tagName == 'TH') {
          // 1st click header:th or row top:th element
          const [thRowIx, thColIx] = cellRowCol(td);
          const [crRowIx, crColIx] = (e.shiftKey)
            ? ((crntElm) ? cellRowCol(crntElm) : [1, 1])
            : [thRowIx, thColIx];
          const isHead = (thRowIx == 0);
          selects = (isHead)
            ? { r1: 1, c1: crColIx, r2: maxrow, c2: thColIx }
            : { r1: crRowIx, c1: 1, r2: thRowIx, c2: maxcol };
          if (e.shiftKey) {
            mousemv = 0;
            drawSelRangeStyle();
          } else {
            mousemv = (isHead) ? 2 : 3;
            setCurrent(cell(selects.r1, selects.c1));
          }
        } else {
          // 1st click => change current
          if (e.shiftKey) {
            const [r, c] = cellRowCol(crntElm);
            setSelRange1stRowCol(r, c)
            setSelRangeLst(td);
            drawSelRangeStyle();
            mousemv = 0;
          } else {
            setCurrent(td);
            setSelRange1st(td);
            mousemv = 1;
          }
        }
      } if (e.detail == 2) {
        if (td.tagName == 'TH') {
          // duble click => widen cell
          clearSelRangeStyle();
          widen(td);
          drawSelRangeStyle();
        } else {
          // duble click => change edit mode
          toEdit(td);
          e.preventDefault();
        }
      }
    }
    tableElm.addEventListener('mousedown', event_mousedown);
    /****************************************************************
     * mouse move event
     * @param e MouseEvent
     */
    const event_mousemove = (e: MouseEvent) => {
      if (mousemv == 0) return;
      const td = e.target as HTMLTableCellElement;
      let [r, c] = cellRowCol(td);
      if (mousemv == 1 && selects.r2 == r && selects.c2 == c) return;
      if (mousemv == 2) r = selects.r2;
      if (mousemv == 3) c = selects.c2;
      clearSelRangeStyle();
      [selects.r2, selects.c2] = [r, c];
      drawSelRangeStyle();
    }
    tableElm.addEventListener('mousemove', event_mousemove);
    /****************************************************************
     * mouse leave event
     * @param e MouseEvent
     */
    const event_mouseleave = (e: MouseEvent) => {
      if (mousemv == 0) return;
      clearSelRangeStyle(true);
      mousemv = 0;
    }
    tableElm.addEventListener('mouseleave', event_mouseleave);
    /****************************************************************
     * mouse up event
     * @param e MouseEvent
     */
    const event_mouseup = (e: MouseEvent) => {
      const td = e.target as HTMLTableCellElement;
      const [r, c] = cellRowCol(td);
      if (mousemv == 1 && selects.r1 == r && selects.c1 == c) {
        clearSelRangeStyle(true);
      }
      if (mousemv == 2 && selects.c1 == c) drawSelRangeStyle();
      if (mousemv == 3 && selects.r1 == r) drawSelRangeStyle();
      mousemv = 0;
      crntElm?.focus({ preventScroll: true });
    }
    tableElm.addEventListener('mouseup', event_mouseup);
    /****************************************************************
     * contextmenu event
     * @param e MouseEvent
     */
    const event_contextmenu = (e: MouseEvent) => {
      const { r1, c1, r2, c2 } = range();
      const ret = this.menu(e, r1, c1, r2, c2);
      if (ret) {
        e.preventDefault();
      }
      return ret;
    }
    tableElm.addEventListener('contextmenu', event_contextmenu);

    /****************************************************************
     * keypress event
     * @param e KeyboardEvent
     */
    const event_keypress = (e: KeyboardEvent) => {
      const td = e.target as HTMLTableCellElement;
      if (!editElm) {
        toEdit(td, e.key);
      }
    }
    tableElm.addEventListener('keypress', event_keypress);
    let escapecnt = 0;
    const { offsetWidth: zzWidth, offsetHeight: zzHeight } = cell(0, 0);
    /****************************************************************
     * key down event
     * @param e KeyboardEvent
     */
    const event_keydown = (e: KeyboardEvent) => {
      const thisCell = e.target as HTMLTableCellElement;
      const [thisRowIx, thisColIx] = cellRowCol(thisCell);
      const rangeAll = { r1: 1, c1: 1, r2: maxrow, c2: maxcol };
      //-------------------------------------------------------------
      /** 矢印によるフォーカスの移動                                 */
      const arrow = (opt: ScrollToOptions, rowix: number, colix: number): HTMLTableCellElement => {
        const td = cell(rowix, colix);
        {
          const ofLeft = td.offsetLeft - zzWidth;
          if (ofLeft < scrollElm.scrollLeft) scrollElm.scroll({ left: ofLeft } as ScrollToOptions);
        }
        {
          const ofLeft = td.offsetLeft + td.clientWidth + scrollElm.clientLeft - scrollElm.clientWidth;
          if (ofLeft > scrollElm.scrollLeft) scrollElm.scroll({ left: ofLeft } as ScrollToOptions);
        }
        {
          const ofTop = td.offsetTop - zzHeight;
          if (ofTop < scrollElm.scrollTop) scrollElm.scroll({ top: ofTop } as ScrollToOptions)
        }
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
      /** 矢印によるフォーカスの上下左右移動                         */
      const updownleftright = (isUpDown: boolean, isUpOrLeft: boolean, range: boolean = false): HTMLTableCellElement => {
        const b = (range && selects.c2 >= 0);
        const { r1, c1, r2, c2 } = b ? selects : rangeAll;
        let [rowIx, colIx] = [thisRowIx, thisColIx];
        const [A, B, C, D, E] = (isUpDown)
          ? (isUpOrLeft)
            ? [(rowIx > r1), -1, 0, r2, (colIx > c1) ? colIx - 1 : c2]
            : [(rowIx < r2), +1, 0, r1, (colIx < c2) ? colIx + 1 : c1]
          : (isUpOrLeft)
            ? [(colIx > c1), 0, -1, (rowIx > r1) ? rowIx - 1 : r2, c2]
            : [(colIx < c2), 0, +1, (rowIx < r2) ? rowIx + 1 : r1, c1];
        [rowIx, colIx] = A ? [rowIx + B, colIx + C] : ((b) ? [D, E] : [rowIx, colIx]);
        return arrow(getScroll(rowIx, colIx), rowIx, colIx);
      }
      //-------------------------------------------------------------
      /** 矢印によるフォーカスの移動                                 */
      const arrowmove = (isUpDown: boolean, isShift: boolean, dir: boolean) => {
        if (isShift) {
          clearSelRangeStyle();
          if (selects.c1 < 0) {
            setSelRange1st(thisCell);
          }
          const _td = updownleftright(isUpDown, dir);
          setSelRangeLst(_td);
          drawSelRangeStyle();
        } else {
          clearSelRangeStyle(true);
          updownleftright(isUpDown, dir);
        }
      }
      //-------------------------------------------------------------
      // 編集モード時のキー処理
      if (editElm) {
        switch (e.key) {
          case 'Tab':
            updownleftright(false, e.shiftKey, true);
            break;
          case 'Enter':
            updownleftright(true, e.shiftKey, true);
            break;
          case 'Escape':
            thisCell.innerText = beforeValue!;
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
      else {
        escapecnt--;
        switch (e.key) {
          case 'ArrowDown':
            arrowmove(true, e.shiftKey, false);
            break;
          case 'ArrowUp':
            arrowmove(true, e.shiftKey, true);
            break;
          case 'ArrowRight':
            arrowmove(false, e.shiftKey, false);
            break;
          case 'ArrowLeft':
            arrowmove(false, e.shiftKey, true);
            break;
          case 'Home':
            if (e.ctrlKey) {
              arrow(getScroll(1, 1), 1, 1);
            } else {
              arrow(getScroll(thisRowIx, 1), thisRowIx, 1);
            }
            break;
          case 'End':
            if (e.ctrlKey) {
              arrow(getScroll(maxrow, maxcol), maxrow, maxcol);
            } else {
              arrow(getScroll(thisRowIx, maxcol), thisRowIx, maxcol);
            }
            break;
          case 'Tab':
            updownleftright(false, e.shiftKey, true);
            break;
          case 'Enter':
            updownleftright(true, e.shiftKey, true);
            break;
          case 'F2':
            toEdit(thisCell);
            e.preventDefault();
            break;
          case 'Backspace':
            const newtd = toEdit(thisCell, '');
            if (newtd) setText(newtd, '');
            e.preventDefault();
            break;
          case 'Delete':
            if (e.shiftKey) {
              // cut
              elm2clipboard();
            }
            deleteTexts();
            e.preventDefault();
            break;
          case 'x':
            if (e.ctrlKey) {
              // cut
              elm2clipboard();
              deleteTexts();
              e.preventDefault();
            }
            break;
          case 'c':
            if (e.ctrlKey) {
              // copy
              elm2clipboard();
              e.preventDefault();
            }
            break;
          case 'v':
            if (e.ctrlKey) {
              // paste
              clipboard2elm();
              e.preventDefault();
            }
            break;
          case 'Insert':
            if (e.ctrlKey) {
              // copy
              elm2clipboard();
              e.preventDefault();
            }
            if (e.shiftKey) {
              // paste
              clipboard2elm();
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
          case 'Escape':
            if (escapecnt < 0) {
              escapecnt = 1;
            } else if (escapecnt >= 0) {
              clearCpyRangeStyle();
              clearCpyData();
            }
            break;
        }
      }
    }
    tableElm.addEventListener('keydown', event_keydown);
    /****************************************************************
     * Escapeキー戻値用
     */
    let beforeValue: string | null;

    /****************************************************************
     * フォーカスアウトイベント処理，表示モードにする
     */
    const editBlue = () => {
      if (editElm) {
        const thisValue = editElm.innerText;
        editElm.scrollLeft = 0
        editElm.removeEventListener('blur', editBlue);
        editElm.removeAttribute('contentEditable');
        const [r, c] = cellRowCol(editElm);
        setText(editElm, thisValue);
        if (thisValue != beforeValue && beforeValue != null) {
          const hist = { r: r, c: c, b: beforeValue, a: thisValue };
          addhists([hist]);
        }
        if (this._opts.editModeAutoResize) {
          widen(headTrElm.children[editElm.cellIndex] as HTMLTableCellElement);
        }
      }
      beforeValue = null;
      editElm = null;
    }

    /****************************************************************
     * 対象セルを編集モードにする
     * @param td 対象エレメント
     * @param val キーイベントによる値
     * @returns 対象セルエレメント または 作り直したセルエレメント
     */
    const toEdit = (td: HTMLTableCellElement, val?: string) => {
      const realStyle = window.getComputedStyle(td);
      if (realStyle.backgroundColor == 'rgb(248, 248, 248)') return null;
      clearCpyRangeStyle();
      const [r, c] = cellRowCol(td);
      const editfnc = getEditFunc(td);
      beforeValue = text(td);
      if (editfnc) {
        // 編集機能あり
        editfnc(td, val || beforeValue).then(v => {
          if (v != null) {
            setText(td, v);
            addhists([{ r: r, c: c, b: beforeValue!, a: v }]);
          }
        });
        return td;
      } else {
        // 編集機能なし
        td.innerText = beforeValue;
        td.contentEditable = 'true';
        const newtd = td.parentElement?.insertBefore(td.cloneNode(true), td) as HTMLTableCellElement;
        setCurrent(newtd);
        newtd.addEventListener('blur', editBlue);
        const [sel, rng] = [window.getSelection(), document.createRange()];
        rng.selectNodeContents(newtd);
        sel?.removeAllRanges();
        sel?.addRange(rng)
        td.remove();
        editElm = newtd;
        return newtd;
      }
    }

    //---------------------------------------------------------------
    // ..
    let history: HISTS[] = [];
    let history_pos: number = -1;
    let history_dwn: boolean = false;
    /****************************************************************
     * 編集履歴：履歴クリア
     */
    const clearHistory = () => {
      history.length = 0;
      history_pos = -1;
      history_dwn = false;
    }
    /****************************************************************
     * 編集履歴：履歴追加
     * @param hists 履歴情報
     */
    const addhists = (hists: HISTS) => {
      if ((history.length - 1 == history_pos && history_dwn) || history_pos == -1) {
        history.push(hists);
        history_pos++;
      } else {
        if (history_dwn) history_pos++;
        history.splice(history_pos, 99999, hists);
      }
      history_dwn = true;
    }
    //---------------------------------------------------------------
    // ..
    const undoredoRange = (r1: number, c1: number, r2: number, c2: number) => {
      if (r1 != r2 || c1 != c2) {
        setSelRange1stRowCol(r1, c1);
        setSelRangeLstRowCol(r2, c2);
        drawSelRangeStyle();
      }
      const td = cell(r1, c1);
      td.focus();
      setCurrent(td);
    }
    /****************************************************************
     * 編集履歴：アンドゥ＆リドゥ処理
     * @param redo true:リドゥ, false:アンドゥ
     */
    const undoredo = (redo: boolean) => {
      let pos = history_pos;
      if (
        (pos < 0) ||
        (!redo && pos <= 0 && !history_dwn) ||
        (redo && history.length - 1 == pos && history_dwn)) return;
      if (redo != history_dwn) {
        history_dwn = redo;
      } else {
        pos += (redo ? history.length - 1 > pos : pos > 0) ? (redo ? 1 : -1) : 0;
      }
      const hist = history[pos];
      history_pos = pos;
      const [v1, v2] = [hist[0], hist[hist.length - 1]];
      let index;
      clearCpyRangeStyle();
      clearSelRangeStyle();
      if (v1.c == 0) {
        // c:0,a:r => remove row / c:0,a:i => insert row
        const { a, r } = v1;
        if (a == 'i') {
          if (redo) { insertRow(r); } else { removeRow(r); }
        } else if (a == 'r') {
          if (redo) { removeRow(r); } else { insertRow(r); }
        }
        index = (redo) ? hist.length : 1;
        undoredoRange(r, 1, r, maxcol);
      } else if (v1.r == 0) {
        // r:0,a:r => remove col / r:0,a:i => insert col
        const { a, c, d } = v1;
        if (a == 'i') {
          if (redo) { insertCol(c, d); } else { removeCol(c); }
        } else if (a == 'r') {
          if (redo) { removeCol(c); } else { insertCol(c, d); }
        }
        index = (redo) ? hist.length : 1;
        undoredoRange(1, c, maxrow, c);
      } else {
        index = 0;
        undoredoRange(v1.r, v1.c, v2.r, v2.c);
      }
      for (; index < hist.length; index++) {
        const { r, c, a, b } = hist[index];
        setText(cell(r, c), (redo) ? a : b);
      }
    }

    /****************************************************************
     * カラムリサイズ
     * @param thElm 対象エレメント
     */
    const widen = (thElm: HTMLTableCellElement) => {
      const scrollLeft = scrollElm.scrollLeft; // スクロール状態を保持
      const cntnrRect = FIRST_ELEMENT_CHILD(scrollElm)!.getBoundingClientRect();
      const cellElms = tableElm.querySelectorAll(`tbody tr td:nth-child(${thElm.cellIndex + 1})`);
      if (cellElms.length <= 0) return;
      // padding, margin サイズを求める
      const realStyle = window.getComputedStyle(cellElms.item(0));
      const padSize = ''
        + `${realStyle.paddingLeft} + ${realStyle.paddingRight} + `
        + `${realStyle.marginLeft} + ${realStyle.marginRight}`;
      thElm.style.width = '4em';// 一時的にセルのサイズを縮める
      tbodyElm.classList.add('widen');
      // 全ての行をチェックし最大widthを求める (tbody > tr > td)
      let maxWidth = Array.from(cellElms).reduce((a, b) => a.scrollWidth > b.scrollWidth ? a : b).scrollWidth;
      thElm.style.width = `calc(${Math.min(maxWidth, (cntnrRect.width * .7))}px + ${padSize})`;
      tbodyElm.classList.remove('widen');
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
    const tableElm = FIRST_ELEMENT_CHILD(this._thisElm);
    const tbodyElm = FIRST_ELEMENT_CHILD(tableElm);
    for (let _row = 1; _row <= rownum; _row++) {
      for (let _col = 1; _col <= colnum; _col++) {
        const td = tbodyElm.children[_row].children[_col] as HTMLTableCellElement;
        fnc(_row, _col, td.innerText, colnum == _col);
      }
    }
  }

  /******************************************************************
   * テーブルにデータを設定する
   * @param data 設定するデータ
   */
  public setData(data: any[][]): void;

  /******************************************************************
   * テーブルにデータを設定する
   * @param data 設定するデータ
   * @param row1 設定する開始行番号
   * @param col1 設定する開始列番号
   */
  public setData(data: any[][], row1: number, col1: number): void;

  /******************************************************************
   * テーブルにデータを設定する
   * @param data 設定するデータ
   * @param row1 設定する開始行番号
   * @param col1 設定する開始列番号
   */
  public setData(data: any[][], row1?: number, col1?: number): void { }

  /******************************************************************
   * テーブルからデータを取得する
   * @param rownum 取得する行数
   * @param colnum 取得する列数
   * @returns data: any[][]
   */
  public getData(rownum: number, colnum: number): any[][];

  /******************************************************************
   * テーブルからデータを取得する
   * @param row1 取得する開始行番号
   * @param col1 取得する開始列番号
   * @param row2 取得する終了行番号
   * @param col2 取得する終了列番号
   * @returns data: any[][]
   */
  public getData(row1: number, col1: number, row2: number, col2: number): any[][];

  /******************************************************************
   * テーブルからデータを取得する
   * @param rownum 取得する行数 or 取得する開始行番号
   * @param colnum 取得する列数 or 取得する開始列番号
   * @param row 取得する終了行番号
   * @param col 取得する終了列番号
   * @returns data: any[][]
   */
  public getData(rownum: number, colnum: number, row?: number, col?: number): any[][] { return [] }

  /******************************************************************
   * テーブルに行の挿入する
   * @param row 挿入する位置の行番号
   */
  public insertRow(row: number): void { }

  /******************************************************************
   * テーブルから行を削除する
   * @param row 削除する位置の行番号
   */
  public removeRow(row: number): void { }

  /******************************************************************
   * テーブルに列の挿入する
   * @param col 挿入する位置の列番号
   * @param def 定義
   */
  public insertCol(col: number, def?: TYM_EDITOR_DEF): void { }

  /******************************************************************
   * テーブルから列を削除する
   * @param col 削除する位置の列番号
   */
  public removeCol(col: number): void { }

  /******************************************************************
   * 選択範囲のセルをコピーする
   */
  public copy(): void { }

  /******************************************************************
   * カレントセルから貼り付ける
   */
  public paste(): void { }

  /******************************************************************
   * 選択範囲のテキストを消去する
   */
  public delete(): void { }

  /******************************************************************
   * 編集を元に戻す
   */
  public undo(): void { }

  /******************************************************************
   * 編集をやり直す
   */
  public redo(): void { }

}