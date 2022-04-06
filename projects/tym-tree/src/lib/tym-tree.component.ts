/*!
 * tym-tree.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

/**
 * リーフデータ
 */
export interface TYM_LEAF {
  /** リーフに表示する文字 */
  text: string;
  /** リーフごとにアイコンを表示する時のクラス文字列 */
  image?: string;
  /** 子リーフの配列 または 子リーフ取得用関数 */
  children?: TYM_TREE | ((indexs: number[], texts: string[], leaf?: any) => Promise<TYM_TREE>);
  /** 任意のデータ */
  [any: string]: any
}

/**
 * ツリーデータ
 */
export type TYM_TREE = (string | TYM_LEAF | TYM_TREE)[];

/**
 * オプションデータ
 */
export interface TYM_TREE_OPTION {
  /** 子リーフ取得用関数 (TYM_LEAF.childrenは無視する) */
  children?: (indexs: number[], texts: string[], leaf?: any) => Promise<TYM_TREE>;
  /** 初期表示時の開く階層 (0～5) */
  open_level?: number;
  /** 開閉用のマークを非表示する場合にtrueを指定する */
  no_open_close_image?: boolean;
  /**
   * リーフごとのアイコンを表示する時のクラス文字列
   * - open/close/子リーフなし で指定する
   * - 文字列を指定した場合は 全て同じアイコンを表示する
   */
  images?: string | {
    open: string;
    close: string;
    none?: string;
  }
  /** リーフオープンアクションの関数を定義, 規定値: { } */
  doLeafOpen?: (indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;
  /** リーフクローズアクションの関数を定義, 規定値: { } */
  doLeafClose?: (indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;
  /** リスト表示アクションの関数を定義, 規定値: { } */
  doDrawList?: (indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;
  /** コンテキストアクションの関数を定義, 規定値: true */
  doContext?: (indexs: number[], texts: string[], event: MouseEvent, leaf?: TYM_LEAF) => boolean;

  /** ドラッグタイプ(effectAllowed), 規定値: none */
  dragType?: 'none' | 'copy' | 'move' | 'copyMove';
  /** ドロップ効果(dropEffect), 規定値: none */
  dropType?: 'none' | 'copy' | 'move';
  /** ドラッグ開始時の関数を定義 */
  doDragStart?: (event: DragEvent, indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;
  /** ドラッグ終了時の関数を定義, 規定値: { } */
  doDragEnd?: (event: DragEvent, indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;
  /** ドロップターゲットに入った時の関数を定義 */
  doDragEnter?: (event: DragEvent, indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;
  /** ドロップターゲットの上にある時の関数を定義 */
  doDragOver?: (event: DragEvent, indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;
  /** ドロップターゲットにドロップされた時の関数を定義, 規定値: { } */
  doDrop?: (event: DragEvent, indexs: number[], texts: string[], leaf?: TYM_LEAF) => void;

}

const OPN = 'opn';
const CLS = 'cls';
const NOC = 'noc';
const LOD = 'lod';
const DTG = 'dtg';
const CUR = 'cur';
const OFF = 'off';
const SPC = 'spc';
const HOV = 'hov';

const NONE = 'none';

const DRAGSTART = 'dragstart';
const DRAGEND = 'dragend';
const DRAGENTER = 'dragenter';
const DRAGOVER = 'dragover';
const DRAGLEAVE = 'dragleave';
const DROP = 'drop';

const MOUSEENTER = 'mouseenter';
const MOUSELEAVE = 'mouseleave';
const WHEEL = 'wheel';
const CLICK = 'click';
const DBLCLICK = 'dblclick';
const CONTEXTMENU = 'contextmenu';
const KEYDOWN = 'keydown';
const FOCUS = 'focus';
const FOCUSOUT = 'focusout';

const isSpanTag = (elm: Element | null) => elm?.tagName == 'SPAN';
const isDivTag = (elm: Element | null) => elm?.tagName == 'DIV';
const dispatchProgress = (elm: Element | null) => elm?.dispatchEvent(new Event('progress'));
const targetSpan = (e: Event): [HTMLElement, HTMLElement] => {
  const target = e.target as HTMLElement;
  const parent = parentElement(target) as HTMLElement;
  return isSpanTag(parent) ? [target, parent] : [target, target];
}
const swap_open_close_str = (elm: HTMLElement) =>
  elm.classList.contains(CLS) ? [CLS, OPN] : elm.classList.contains(OPN) ? [OPN, CLS] : [NOC, NOC];
const remove_children = (_div: any) => {
  while (_div?.firstChild) { _div.removeChild(_div.firstChild); }
}
const prevElement = (elm: HTMLElement | null) => elm?.previousElementSibling as HTMLElement | null;
const nextElement = (elm: HTMLElement | null) => elm?.nextElementSibling as HTMLElement | null;
const parentElement = (elm: HTMLElement | null) => elm?.parentElement as HTMLElement | null;
const selScopeSpan = (elm: HTMLElement) => Array.from(elm.querySelectorAll(':scope>span'));

@Component({
  selector: 'ngx-tym-tree',
  template: `<div class="d" tabIndex="0"></div>`,
  styleUrls: ['./tym-tree.component.scss']
})
export class TymTreeComponent implements OnInit {

  /********************************************************************
  tree = [
    'leaf-text',
    'leaf-text',
    [
      'leaf-text',
      'leaf-text',
    ],
    'leaf-text',
  ]
  *********************************************************************
  tree = [
    { text: 'leaf-text' },
    { text: 'leaf-text', children:
      [
        { text: 'leaf-text' },
        { text: 'leaf-text', children:
          [
            { text: 'leaf-text' },
          ]
        },
      ]
    },
    { text: 'leaf-text' },
  ]
  ********************************************************************/

  /**
   * this native element
   */
  private thisElm: HTMLElement;
  private divElm!: HTMLDivElement;

  /**
   * 表示するデータ
   */
  @Input() tree: TYM_TREE = [];

  /**
   * オプションデータ
   */
  @Input() option: TYM_TREE_OPTION = {};

  //-------------------------------------------------------------------

  // デフォルトイベント関数
  private doLeafOpen = (indexs: number[], texts: string[], leaf?: any): void => { };
  private doLeafClose = (indexs: number[], texts: string[], leaf?: any): void => { };
  private doDrawList = (indexs: number[], texts: string[], leaf?: any): void => { };
  private doContext = (indexs: number[], texts: string[], event: MouseEvent, leaf?: any) => { return true };
  private dragType = NONE;
  private dropType = NONE;
  private doDragStart = this._doDragStart;
  private doDragEnd = (event: DragEvent, indexs: number[], texts: string[], leaf?: any): void => { };
  private doDragEnter = this._doDragEnterOrOver;
  private doDragOver = this._doDragEnterOrOver;
  private doDrop = (event: DragEvent, indexs: number[], texts: string[], leaf?: any): void => { };

  /**
   * コンストラクター
   * 
   * @param {ElementRef} elementRef このコンポーネントがセットされたDOMへの参照
   * @param {Renderer2} renderer DOMを操作用
   * @memberof TymModalComponent
   */
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.thisElm = this.elementRef.nativeElement;
  }

  //-------------------------------------------------------------------

  // アイコン用クラス文字列
  private i_opn: string = '';
  private i_cls: string = '';
  private i_noc: string = '';

  /**
   * 初期処理
   *
   * @memberof TymTreeComponent
   */
  ngOnInit(): void {
    // オプション定義からデフォルト値マージ
    const opt = this.option;
    if (opt.open_level) {
      if (opt.open_level < 0 || 5 < opt.open_level) opt.open_level = 0;
    }
    if (opt.images) {
      const images = opt.images;
      const SPCS = SPC + ' ';
      if (typeof images === 'string') {
        this.i_opn = this.i_cls = this.i_noc = SPCS + images;
      } else {
        this.i_opn = SPCS + images.open;
        this.i_cls = SPCS + images.close;
        if (images.none) {
          this.i_noc = SPCS + images.none;
        } else {
          this.i_noc = SPC;
        }
      }
    }
    ['doLeafOpen', 'doLeafClose', 'doDrawList', 'doContext', 'dragType', 'dropType',
      'doDragStart', 'doDragEnd', 'doDragEnter', 'doDragOver', 'doDrop'
    ].forEach(k => { if ((opt as any)[k]) (this as any)[k] = (opt as any)[k] });

    // 初期リーフ生成
    const divElm = this.thisElm.firstElementChild as HTMLDivElement;
    this.divElm = divElm;

    this.hover_tm_dly = 1;
    this.create_child(divElm, this.tree, 0);
    this.hover_tm_dly = null;

    // <SPAN> OP-CL <SPAN ICON></SPAN> <SPAN>TEXT</SPAN> </SPAN>
    const ev = (e: Event, f: Function) => {
      const span = e.target as HTMLElement;
      if (span.classList.contains(LOD)) return;
      const parent = parentElement(span) as HTMLElement;
      f(e, isSpanTag(parent) ? parent : span);
    }

    //イベント登録
    ([
      //キーボードイベント操作
      [KEYDOWN, this.key_event],
      //ホイール操作時にホバーを消す
      [WHEEL, () => this.hover_off_delay()],
      //他からのTABキーによるフォーカスイン時にツリー内にフォーカスを設定する
      [FOCUS, () => this.set_cur_focus()],
      //ツリー内からフォーカスアウト時の動作
      [FOCUSOUT, (e: MouseEvent) => {
        const related = e.relatedTarget as HTMLElement;
        const parent = parentElement(related) as HTMLElement;
        //ツリー内からフォーカスアウトするときにホバーを消す
        if (!parent?.classList.contains(HOV)) {
          this.hover_off();
        }
      }],
      //クリックイベントの動作
      [CLICK, (e: MouseEvent) => ev(e, this.click_event)],
      //ダブルクリックイベントの動作
      [DBLCLICK, (e: MouseEvent) => ev(e, this.dblclick_event)],
      //コンテキストメニューイベントの動作
      [CONTEXTMENU, (e: MouseEvent) => ev(e, this.context_event)]
    ] as [string, any][]).forEach(i => divElm.addEventListener(i[0], i[1]));

    //ドロップ用のイベント等設定
    this.setDropElm(divElm);

  }

  //-------------------------------------------------------------------

  /**
   * ドラッグ用のイベント等設定
   * @param hovElm HTMLElement
   * @param span HTMLElement
   */
  private setDragElm(hovElm: HTMLElement, span: HTMLElement): void {
    hovElm.draggable = (this.dragType != NONE);
    const evinfos: [string, any][] = [
      [DRAGSTART, (e: DragEvent) => this._dragStart(e, span)],
      [DRAGEND, (e: DragEvent) => this._dragEnd(e, span)]
    ];
    if (hovElm.draggable) {
      evinfos.forEach(inf => hovElm.addEventListener(inf[0], inf[1]));
    } else {
      evinfos.forEach(inf => hovElm.removeEventListener(inf[0], inf[1]));
    }
  }

  /**
   * ドロップ用のイベント等設定
   * @param thisElm HTMLElement
   */
  private setDropElm(thisElm: HTMLElement): void {
    const droptarget = (this.dropType != NONE);
    const evinfos: [string, any][] = [
      [DRAGENTER, this._dragEnter],
      [DRAGOVER, this._dragOver],
      [DRAGLEAVE, this._dragleave],
      [DROP, this._drop]
    ];
    if (droptarget) {
      evinfos.forEach(inf => thisElm.addEventListener(inf[0], inf[1]));
    } else {
      evinfos.forEach(inf => thisElm.removeEventListener(inf[0], inf[1]));
    }
  }

  //-------------------------------------------------------------------

  private dragidxs: number[] = [];
  private dragtxts: string[] = [];
  private dragleaf: any = undefined;

  /**
   * ドラッグ開始時の関数
   * @param event DragEvent
   * @param span HTMLElement
   */
  private _dragStart = (event: DragEvent, span: HTMLElement): void => {
    this.hover_tm_dly = 1;
    const [idxs, txts, leaf] = [this.dragidxs, this.dragtxts, this.dragleaf] = this.index_array(span);
    this.doDragStart!(event, idxs, txts, leaf);
  }

  /**
   * ドラッグ開始時のデフォルト関数
   * @param event DragEvent
   * @param indexs エレメントのインデックス情報
   * @param texts エレメントのテキスト情報
   * @param leaf リーフオブジェクト
   */
  private _doDragStart(event: DragEvent, indexs: number[], texts: string[], leaf: any): void {
    const dt = event.dataTransfer;
    if (dt) {
      dt.setData('text/plain', indexs.toString());
      dt.setData('application/json', JSON.stringify({ indexs, texts }));
      dt.effectAllowed = this.dragType as any;
    }
  };

  /**
   * ドラッグ終了時の関数を定義
   * @param event DragEvent
   * @param span HTMLElement
   */
  private _dragEnd = (event: DragEvent, span: HTMLElement): void => {
    this.doDragEnd!(event, this.dragidxs, this.dragtxts, this.dragleaf);
    this.hover_tm_dly = null;
  }

  /**
   * ドロップターゲットに入った時の関数
   * @param event DragEvent
   */
  private _dragEnter = (event: DragEvent): void => {
    const [, span] = targetSpan(event);
    const [idxs, txts, leaf] = this.index_array(span);
    this.doDragEnter(event, idxs, txts, leaf);
  }

  /**
   * ロップターゲットの上にある時の関数
   * @param event DragEvent
   */
  private _dragOver = (event: DragEvent): void => {
    const [, span] = targetSpan(event);
    const [idxs, txts, leaf] = this.index_array(span);
    span.classList.add(DTG);
    this.doDragOver!(event, idxs, txts, leaf);
  }

  /**
   * ドロップターゲットの上にある時のデフォルト関数
   * @param event DragEvent
   * @param indexs エレメントのインデックス情報
   * @param texts エレメントのテキスト情報
   * @param leaf リーフオブジェクト
   */
  private _doDragEnterOrOver(event: DragEvent, indexs: number[], texts: string[], leaf?: any): void {
    event.preventDefault();
    const dt = event.dataTransfer;
    if (dt) {
      if (this.dropType != dt.effectAllowed) {
        if (dt.effectAllowed == 'copyMove') {
          dt.dropEffect = this.dropType as any;
        } else {
          dt.dropEffect = NONE;
        }
      } else {
        dt.dropEffect = this.dropType as any;
      }
    }
  }

  /**
   * ロップターゲットを離れた時の関数
   * @param event DragEvent
   */
  private _dragleave = (event: DragEvent): void => {
    const [, span] = targetSpan(event);
    span.classList.remove(DTG);
  }

  /**
   * ドロップターゲットにドロップされた時の関数
   * @param event DragEvent
   */
  private _drop = (event: DragEvent): void => {
    const [, span] = targetSpan(event);
    const [idxs, txts, leaf] = this.index_array(span);
    span.classList.remove(DTG);
    this.doDrop!(event, idxs, txts, leaf);
  }

  //-------------------------------------------------------------------

  /**
   * キーボードイベント処理
   * @param e キーボードイベント
   */
  private key_event = (e: KeyboardEvent) => {
    const elm = e.target as HTMLElement;
    switch (e.key) {
      case 'ArrowDown':
        //フォーカスを一つ下へ
        this.set_focus_by_elm(elm, +1);
        break;
      case 'ArrowUp':
        //フォーカスを一つ上へ
        this.set_focus_by_elm(elm, -1);
        break;
      case 'ArrowLeft':
        //ツリーを閉じる
        if (this.open_close_by_keybd(elm, CLS)) {
          this.hover_on(elm);
          const [idxs, txts, leaf] = this.index_array(elm);
          this.doLeafClose(idxs, txts, leaf);
        } else {
          //既に閉じられていた場合は上位階層へ
          const parentDivElm = parentElement(elm) as HTMLDivElement;
          //最上位でなければ実行
          if (!parentDivElm.classList.contains('d')) {
            const prevSpanElm = prevElement(parentDivElm) as HTMLSpanElement;
            this.set_focus_by_elm(prevSpanElm);
          }
        }
        break;
      case 'ArrowRight':
        //ツリーを開く
        if (this.open_close_by_keybd(elm, OPN)) {
          this.hover_on(elm);
          const [idxs, txts, leaf] = this.index_array(elm);
          this.doLeafOpen(idxs, txts, leaf);
        } else {
          //既に開かれていた場合は下位階層へ
          const nextDivElm = nextElement(elm);
          const childSpanElm = nextDivElm?.firstElementChild as HTMLSpanElement | null;
          //下位にエレメントがあれば実行
          if (childSpanElm != null) {
            this.set_focus_by_elm(childSpanElm);
          }
        }
        break;
      case ' ':
        //スペースキーによりツリー＆リスト再取得
        dispatchProgress(elm);
        const [idxs, txts, leaf] = this.index_array(elm);
        setTimeout(() => this.doDrawList(idxs, txts, leaf));
        break;
      case 'Tab':
        //ツリー内からShift+TABキーによるフォーカスアウト時にツリーの前にフォーカスを移す
        if (e.shiftKey) {
          this.divElm.tabIndex = -1;
          setTimeout(() => this.divElm.tabIndex = 0);
        }
        //TABキーはキャンセルしない
        return;
      default:
        //上記以外のキーはキャンセルしない
        return;
    }
    //処理済みのキーボード操作を無効にする
    e.preventDefault();
  }

  /**
   * クリックイベント処理
   * @param e マウスイベント
   * @param span 対象のエレメント
   */
  private click_event = (e: MouseEvent, span: HTMLElement) => {
    if (e.detail == 1) {
      if (this.is_open_close_area(e)) {
        const aft = this.open_close_by_click(span);
        if (aft == OPN) {
          if (!isDivTag(span)) {
            dispatchProgress(span);
          }
        }
      } else {
        const [idxs, txts, leaf] = this.index_array(span);
        setTimeout(() => this.doDrawList(idxs, txts, leaf));
      }
      this.set_focus_by_elm(span);
    }
  }

  /**
   * ダブルクリックイベント処理
   * @param e マウスイベント
   * @param span 対象のエレメント
   */
  private dblclick_event = (e: MouseEvent, span: HTMLElement) => {
    span.focus();
    this.hover_off();
    const aft = this.open_close_by_click(span);
    if (aft != CLS) dispatchProgress(span);
  }

  /**
   * コンテキストメニューイベント処理
   * @param e マウスイベント
   * @param span 対象のエレメント
   * @returns {true:有効, false:キャンセル}
   */
  private context_event = (e: MouseEvent, span: HTMLElement): boolean => {
    this.set_focus_by_elm(span);
    const [idxs, txts, leaf] = this.index_array(span);
    if (!this.doContext(idxs, txts, e, leaf)) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    return true;
  }

  //-------------------------------------------------------------------

  // エレメント作成・削除用
  private create_span_elm = () => this.renderer.createElement('span') as HTMLSpanElement;
  private create_div_elm = () => this.renderer.createElement('div') as HTMLDivElement;

  //-------------------------------------------------------------------

  /**
   * 開閉表示を切り替える
   * @param span 対象のエレメント
   * @param bef 変更前リーフ状態文字列
   * @param aft 変更後リーフ状態文字列
   */
  private swap_open_close(span: HTMLElement, bef: string, aft: string) {
    span.classList.replace(bef, aft);
    // リーフデータにimage設定が無い場合 アイコンの開閉を切り替える
    if (!(span.dataset.image)) {
      const _span = span.firstElementChild as HTMLElement;
      const _icon = (aft == OPN) ? this.i_opn : (aft == CLS) ? this.i_cls : this.i_noc;
      _span.classList.value = _icon;
    }
  }

  /**
   * エレメントの開閉を行う (keyboard)
   * @param span 対象のエレメント
   * @param mode 処理モード ('opn':開く,'cls':閉じる)
   * @returns {true:実行, false:未実行}
   */
  private open_close_by_keybd(span: HTMLElement, mode: string): boolean {
    const [bef, aft] = swap_open_close_str(span);
    if (mode == aft) {
      this.swap_open_close(span, bef, aft);
      this.clear_elm_list();
      if (aft == OPN) {
        if (!isDivTag(span)) {
          dispatchProgress(span);
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * エレメントの開閉を行う (click)
   * @param span 対象のエレメント
   * @returns 実行後のクラス文字列
   */
  private open_close_by_click(span: HTMLElement): string {
    const [bef, aft] = swap_open_close_str(span);
    this.swap_open_close(span, bef, aft);
    this.clear_elm_list();
    return aft;
  }

  /**
   * 開閉マーク,アイコンクリック判定
   * @param event イベントオブジェクト
   * @returns {true:対象, false:非対称}
   */
  private is_open_close_area(event: MouseEvent): boolean {
    let ret = false;
    const [target, span] = targetSpan(event);
    if (target == span) {
      if (!span.classList.contains(OFF)) {
        const { paddingLeft: pads, backgroundPositionX: bgxs } = window.getComputedStyle(span);
        const [ofx, pad, bgx] = [event.offsetX, parseInt(pads), parseInt(bgxs)];
        if (bgx <= ofx && ofx <= pad) {
          ret = true;
        }
      }
    } else if (target.classList.contains(SPC)) {
      if (span.classList.contains(OFF)) ret = true;
    }
    return ret;
  }

  //-------------------------------------------------------------------

  /**
   * エレメントを作成する
   * @param level エレメントの階層番号
   * @param idx 階層ごとの行番号
   * @param text エレメントのテキスト
   * @param image 個別イメージ用クラス文字列
   * @returns 作成したエレメント
   */
  private create_span(level: number, idx: number, text: string, image?: string): HTMLSpanElement {
    const span = this.create_span_elm();
    const spanic = this.create_span_elm();
    const spantx = this.create_span_elm();
    if (image) {
      // リーフデータにimage設定がある場合
      spanic.classList.value = SPC + ' ' + image;
      span.dataset.image = 't';
    } else {
      spanic.classList.value = this.i_cls;
    }
    spantx.innerText = text;
    span.tabIndex = -1;
    span.classList.value = CLS;
    let pad = level + 1;
    if (this.option.no_open_close_image) {
      span.classList.add(OFF);
      pad--;
    }
    span.style.paddingLeft = `${pad}em`;
    span.style.backgroundPositionX = `${level}em`;
    span.dataset.index = `${idx}`;
    span.appendChild(spanic);
    span.appendChild(spantx);

    //エレメントのホバー時にホバーエレメントを作成する
    span.addEventListener(MOUSEENTER, e => {
      this.hover_on(span);
    });
    return span;
  }

  //-------------------------------------------------------------------

  // ホバーエレメント保持用 / ホバー非表示タイミング
  private hover_elm: HTMLSpanElement | null = null;
  private hover_tm_off: any = null;
  private hover_tm_dly: any = null;

  /**
   * ホバーエレメントの削除
   */
  private hover_off() {
    if (this.hover_elm) {
      document.body.removeChild(this.hover_elm);
      this.hover_elm = null;
    }
  }

  /**
   * ホバーエレメントの削除(削除後再表示の遅延あり)
   */
  private hover_off_delay() {
    this.hover_off();
    clearTimeout(this.hover_tm_dly);
    this.hover_tm_dly = setTimeout(() => {
      this.hover_tm_dly = null;
    }, 400);
  }

  /**
   * ホバーエレメントの表示遅延中状態
   * @returns {true:遅延中,false:遅延中ではない}
   */
  private hover_is_delay = () => this.hover_tm_dly != null;

  /**
   * ホバーエレメントの作成
   * @param span 対象のエレメント
   */
  private hover_on(span: HTMLSpanElement) {
    if (this.hover_is_delay()) return;
    this.hover_off();
    const { top: base_t, bottom: base_b } = this.thisElm.getBoundingClientRect();
    const { top: span_t, bottom: span_b, left: span_l, height: span_h } = span.getBoundingClientRect();
    const spanStyle = window.getComputedStyle(span);
    const { width: base_w } = this.divElm.getBoundingClientRect();
    if (Math.floor(base_t) > Math.floor(span_t) || Math.floor(base_b) < Math.floor(span_b)) return;
    const hov_div = this.create_div_elm();
    const hov_inn = span.cloneNode(true) as HTMLSpanElement;
    hov_div.appendChild(hov_inn);
    hov_div.classList.add(HOV);
    Object.assign(hov_div.style, {
      transform: `translate(${span_l}px, ${span_t}px)`,
      height: `${span_h}px`,
      width: `${base_w}px`,
      fontSize: spanStyle.fontSize,
      fontFamily: spanStyle.fontFamily,
      color: spanStyle.color,
    } as CSSStyleDeclaration);
    Object.assign(hov_inn.style, {
      backgroundColor: spanStyle.getPropertyValue('--ho-co'),
      borderColor: spanStyle.getPropertyValue('--ho-bc'),
    } as CSSStyleDeclaration);
    const hovWidth = `calc(100vw - 2em - ${span.lastElementChild?.getBoundingClientRect().left}px)`;
    (hov_inn.lastElementChild as HTMLElement).style.maxWidth = hovWidth;
    //ドラッグ用のイベント等設定
    this.setDragElm(hov_inn, span);
    document.body.appendChild(hov_div);
    this.hover_elm = hov_div;

    //ホバーは数秒後に消す
    clearTimeout(this.hover_tm_off);
    this.hover_tm_off = setTimeout(() => {
      this.hover_tm_off = null;
      this.hover_off();
    }, 1500);

    //イベント登録
    ([
      //マウスが離れたときにホバーを消す
      [MOUSELEAVE, () => this.hover_off()],
      //ホイール操作時にホバーを消す
      [WHEEL, () => this.hover_off_delay()],
      //クリック時に開閉およびフォーカス設定
      [CLICK, (e: MouseEvent) => this.click_event(e, span)],
      //ダブルクリック時に開閉
      [DBLCLICK, (e: MouseEvent) => this.dblclick_event(e, span)],
      //コンテキスト時に開閉
      [CONTEXTMENU, (e: MouseEvent) => this.context_event(e, span)]
    ] as [string, any][]).forEach(i => hov_inn.addEventListener(i[0], i[1]));
  }

  /**
   * ローディングエレメントを作成する
   * @param level エレメントの階層番号
   * @returns 作成したエレメント
   */
  private create_loading(level: number): HTMLSpanElement {
    const span = this.create_span_elm();
    span.classList.value = LOD;
    span.innerText = 'loading...';
    span.style.paddingLeft = `${level + 1}em`;
    span.style.backgroundPositionX = `${level}em`;
    return span;
  }

  /**
   * 対象エレメントのインデックス・テキスト情報を取得する
   * @param span 対象のエレメント
   * @returns エレメントのインデックス・テキスト・リーフ情報
   */
  private index_array(span: HTMLElement): [number[], string[], any] {
    let idxs: number[] = [];
    let txts: string[] = [];
    for (let elm = span; !elm.classList.contains('d'); elm = parentElement(elm)!) {
      const _elm = isSpanTag(elm) ? elm : prevElement(elm) as HTMLElement;
      idxs.push(parseInt(_elm.dataset.index!));
      txts.push((_elm.lastElementChild as HTMLElement).innerText);
    }
    const leaf = (span.onprogress) ? span.onprogress(new ProgressEvent('get')) : undefined;
    return [idxs.reverse(), txts.reverse(), leaf];
  }

  /**
   * 子階層を作成する
   * @param level エレメントの階層番号
   * @param children リスト取得関数
   * @param span 対象のエレメント
   * @param parent 親のエレメント
   */
  private async create_subtree(level: number, children: Function | TYM_TREE, span: HTMLElement, parent: HTMLElement) {
    this.hover_off();
    this.swap_open_close(span, CLS, OPN);
    this.swap_open_close(span, NOC, OPN);
    // リストを作成するdivエレメントを求める
    let _div = nextElement(span) as HTMLElement;
    if (isDivTag(_div)) {
      remove_children(_div);
    } else {
      const _div_wk = this.create_div_elm();
      parent.insertBefore(_div_wk, _div);
      _div = _div_wk;
    }

    // ローディングエレメントを作成
    _div.appendChild(this.create_loading(level));

    // リスト取得関数を呼び出す
    const [idxs, txts, leaf] = this.index_array(span);
    let tree = (typeof children === 'function') ? await children(idxs, txts, leaf) : children;

    // 取得したリストからエレメントを作成する
    if (tree?.length > 0) {
      this.create_child(_div, tree, level + 1);
      this.swap_open_close(span, NOC, OPN);
    } else {
      _div.removeChild(_div.firstChild!);
      this.swap_open_close(span, OPN, NOC);
    }
    this.hover_on(span);
    this.clear_elm_list();
  }

  /**
   * リーフを作成する
   * @param parent 親エレメント
   * @param l リーフ情報
   * @param level 階層番号
   * @param o インデックス用
   */
  private create_leaf(parent: HTMLElement, l: string | TYM_TREE | TYM_LEAF, level: number, o: any) {
    const [_text, _array, _image, _leaf] = (typeof l === 'string')
      ? [l, , ,] : (Array.isArray(l)) ? [, l, ,] : [l.text, , l.image, l];
    const setprogress = (elm: HTMLElement, ch: Function | TYM_TREE) => {
      elm.onprogress = (e: Event): Promise<any> | any => {
        if (e.type == 'get') return _leaf;
        return this.create_subtree(level, ch, elm, parent);
      }
      if (level < this.option.open_level!) {
        dispatchProgress(elm);
      }
    }
    // l is not string array
    if (_text) {
      const span = this.create_span(level, o.idx++, _text, _image);
      parent.appendChild(span);
      const optChildren = this.option.children;
      if (typeof optChildren === 'function') {
        setprogress(span, optChildren);
      } else {
        if (_leaf) {
          setprogress(span, (_leaf as TYM_LEAF).children!);
        }
        if (!_leaf?.children) {
          this.swap_open_close(span, CLS, NOC);
        }
      }
    }
    // l is string array
    if (_array) {
      const prev = parent.lastElementChild as HTMLSpanElement;
      if (prev.classList.contains(NOC)) {
        this.swap_open_close(prev, NOC, CLS);
      }
      setprogress(prev, _array);
    }
  }

  /**
   * ツリーのリーフ群を作成する
   * @param parent 親リーフ
   * @param children 子リーフ群
   * @param level エレメントの階層番号
   */
  private create_child(parent: HTMLElement, children: TYM_TREE, level: number) {
    remove_children(parent);
    const o = { idx: 0 };
    children.forEach(l => this.create_leaf(parent, l, level, o));
    if (children.length == 0) {
      const option = this.option;
      if (typeof option.children === 'function') {
        const children = option.children;
        // ローディングエレメントを作成
        parent.appendChild(this.create_loading(level));

        // リスト取得関数を呼び出す
        children([], []).then((tree) => {
          // 取得したリストからエレメントを作成する
          if (tree.length > 0) {
            this.create_child(parent, tree, 0);
          } else {
            parent.removeChild(parent.firstChild!);
          }
          this.clear_elm_list();
        })
      }
    }
  }

  //-------------------------------------------------------------------

  //フォーカス行のエレメント
  private cur_elm: HTMLElement | null = null;

  /**
   * フォーカス位置を設定する
   * @param elm 対象のエレメント
   * @param dif 差分位置
   */
  private set_focus_by_elm(elm: HTMLElement, dif: number = 0) {
    this.set_focus_by_idx(this.elm_list.indexOf(elm) + dif);
  }
  /**
   * フォーカス位置を設定する(カレント)
   */
  private set_cur_focus() {
    this.set_focus_by_idx(parseInt(this.divElm.dataset.idx || "0"));
  }
  /**
   * フォーカス位置を設定する(カレント)
   */
  private set_focus_by_idx(idx: number) {
    const rng = this.elm_list.length;
    if (0 <= idx && idx < rng) {
      const elm = this.elm_list[idx];
      this.set_focus(elm, idx);
    }
  }
  /**
   * フォーカス位置を設定する
   * @param elm 対象のエレメント
   * @param idx 設定するフォーカスの位置
   */
  private set_focus(elm: HTMLElement, idx: number) {
    this.cur_elm?.classList.remove(CUR);
    elm.classList.add(CUR);
    elm.focus();
    this.cur_elm = elm;
    this.divElm.dataset.idx = idx.toString();
    this.hover_on(elm);
  }

  //-------------------------------------------------------------------

  private _elm_list: any = null;
  private clear_elm_list = () => this._elm_list = null;

  /**
   * 表示されているエレメントリストプロパティ(getter)
   */
  private get elm_list(): HTMLElement[] {
    if (!this._elm_list) {
      this._elm_list = Array.from(this.divElm.querySelectorAll('div>span:not(.cls+div span,.lod)'));
    }
    return this._elm_list;
  }

  //-------------------------------------------------------------------
  // 公開関数
  //-------------------------------------------------------------------

  /**
   * 指定した，階層ごとのインデックス番号をもとに，階層を開く
   * @param indexs 階層ごとのインデックス番号
   * @param force true:再描画, false:未描画の場合だけ再描画
   * @returns true:全て開けた, false:開けなかった
   */
  public async openTree(indexs: number[], force: boolean = false): Promise<boolean> {
    const ot = async (divElm: HTMLElement, level: number): Promise<boolean> => {
      const n = indexs[level];
      const spanElms = selScopeSpan(divElm);
      if (n >= spanElms.length) return Promise.resolve(false);
      const span = spanElms[n] as HTMLElement;
      //ツリーを開く
      if (force || !isDivTag(nextElement(span))) {
        if (span.onprogress) {
          await span.onprogress(new ProgressEvent(''));
        } else {
          this.set_focus_by_elm(span);
          return Promise.resolve(false);
        }
      }
      const div = nextElement(span) as HTMLElement;
      this.open_close_by_keybd(span, OPN);
      level++;
      if (level < indexs.length) {
        return ot(div, level);
      } else {
        this.set_focus_by_elm(span);
        return Promise.resolve(true);
      }
    }
    return (indexs.length == 0)
      ? Promise.resolve(false)
      : ot(this.divElm, 0);
  }

  /**
   * ターゲットエレメントとチャイルドエレメントを求める
   * @param indexs 階層ごとのインデックス番号
   * @returns [ターゲットエレメント, チャイルドエレメント]
   */
  private getIdxElm(indexs: number[]): [HTMLElement | null, HTMLElement | null] {
    const tg = (divElm: HTMLElement, level: number): [HTMLElement | null, HTMLElement | null] => {
      const n = indexs[level++];
      const spanElms = selScopeSpan(divElm);
      if (n >= spanElms.length) return [null, null];
      //ターゲットエレメント
      const span = spanElms[n] as HTMLElement;
      if (!isDivTag(nextElement(span))) {
        return (level < indexs.length) ? [null, null] : [span, null];
      }
      //チャイルドエレメント
      const div = nextElement(span) as HTMLElement;
      // level++;
      return (level < indexs.length) ? tg(div, level) : [span, div];
    }
    return tg(this.divElm, 0)
  }

  /**
   * 指定した，階層ごとのインデックス番号の下位階層をクリア・再描画
   * @param indexs 階層ごとのインデックス番号
   */
  public clearTree(indexs: number[] = []) {
    if (indexs.length == 0) {
      this.create_child(this.divElm, this.tree, 0);
      this.clear_elm_list();
    } else {
      const [_span, _div] = this.getIdxElm(indexs);
      remove_children(_div);
      dispatchProgress(_span);
    }
  }

  /**
   * 指定した，階層ごとのインデックス番号のリーフとその下位階層を削除
   * @param indexs 階層ごとのインデックス番号
   */
  public removeLeaf(indexs: number[] = []) {
    if (indexs.length > 0) {
      const [_span, _div] = this.getIdxElm(indexs);
      if (_span) {
        remove_children(_div);
        _div?.parentElement?.removeChild(_div);
        const _parent = _span.parentElement as HTMLElement;
        _parent.removeChild(_span);
        if (_parent.childElementCount == 0) {
          const span = prevElement(_parent) as HTMLElement;
          _parent.parentElement?.removeChild(_parent);
          this.swap_open_close(span, OPN, CLS);
        } else {
          const spanElms = selScopeSpan(_parent);
          spanElms.forEach((elm, idx) => {
            (elm as HTMLElement).dataset.index = idx.toString();
          })
        }
        this.clear_elm_list();
      }
    }
  }

  /**
   * 
   * @param indexs 階層ごとのインデックス番号
   * @param text 設定するテキスト
   */
  public updateLeafText(indexs: number[], text: string) {
    if (indexs.length > 0 && text.length > 0) {
      const [_span,] = this.getIdxElm(indexs);
      if (_span?.lastElementChild) {
        const elm = _span?.lastElementChild as HTMLElement;
        elm.innerText = text;
      }
    }
  }

  //-------------------------------------------------------------------
  // 公開スタティック関数
  //-------------------------------------------------------------------

  /**
   * リーフデータを取得する関数
   * @param tree 描画に利用しているtree
   * @param indexs 階層ごとのインデックス番号
   * @returns [`tree` の部分ツリー，存在しない場合は `null`, `subtree` に対するインデックス番号]
   */
  public static getTree(tree: TYM_TREE, indexs: number[] = []): [TYM_TREE | null, number] {
    const ot = (_tree: TYM_TREE, level: number): [TYM_TREE | null, number] => {
      if (!Array.isArray(_tree)) return [null, -1];
      let n = indexs[level];
      n = _tree.findIndex((l, i) => {
        if (Array.isArray(l)) n++;
        return (i == n);
      });
      const t = (typeof (_tree[n]) === 'string' && Array.isArray(_tree[n + 1])) ? _tree[n + 1] : _tree[n];
      level++;
      if (level < indexs.length) {
        if (typeof t === 'string') return [null, -1];
        if (Array.isArray(t)) {
          return ot(t, level);
        } else if (typeof t === 'string') {
          return [null, -1];
        } else {
          return (Array.isArray(t.children)) ? ot(t.children, level) : [null, -1];
        }
      } else {
        return [_tree, n];
      }
    }
    return (indexs.length == 0) ? [null, -1] : ot(tree, 0);
  }
}