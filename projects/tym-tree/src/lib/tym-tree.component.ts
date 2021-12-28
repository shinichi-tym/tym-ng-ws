/*!
 * tym-tree.js
 * Copyright (c) 2021 shinichi tayama
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
  children?: TYM_TREE | ((indexs: number[], texts: string[]) => Promise<TYM_TREE>);
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
  children?: (indexs: number[], texts: string[]) => Promise<TYM_TREE>;
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
  doLeafOpen?: (indexs: number[], texts: string[]) => void;
  /** リーフクローズアクションの関数を定義, 規定値: { } */
  doLeafClose?: (indexs: number[], texts: string[]) => void;
  /** リスト表示アクションの関数を定義, 規定値: { } */
  doDrawList?: (indexs: number[], texts: string[]) => void;
  /** コンテキストアクションの関数を定義, 規定値: true */
  doContext?: (indexs: number[], texts: string[], event: MouseEvent) => boolean;
}

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
  private doLeafOpen = (indexs: number[], texts: string[]): void => { };
  private doLeafClose = (indexs: number[], texts: string[]): void => { };
  private doDrawList = (indexs: number[], texts: string[]): void => { };
  private doContext = (indexs: number[], texts: string[], event: MouseEvent) => { return true };

  /**
   * コンストラクター
   * 
   * @param {ElementRef} elementRef このコンポーネントがセットされたDOMへの参照
   * @param {Renderer2} renderer DOMを操作用
   * @param {TymModalService} modal モーダルサービス
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
    if (opt.images) {
      const images = opt.images;
      if (typeof images == 'string') {
        this.i_opn = this.i_cls = this.i_noc = 'spc ' + images;
      } else {
        this.i_opn = 'spc ' + images.open;
        this.i_cls = 'spc ' + images.close;
        if (images.none) {
          this.i_noc = 'spc ' + images.none;
        } else {
          this.i_noc = 'spc';
        }
      }
    }
    if (opt.doLeafOpen) this.doLeafOpen = opt.doLeafOpen;
    if (opt.doLeafClose) this.doLeafClose = opt.doLeafClose;
    if (opt.doDrawList) this.doDrawList = opt.doDrawList;
    if (opt.doContext) this.doContext = opt.doContext;

    // 初期リーフ生成
    const divElm = this.thisElm.firstElementChild as HTMLDivElement;
    this.divElm = divElm;
    this.create_child(divElm, this.tree, 0);

    //キーボードイベント操作
    divElm.addEventListener('keydown', this.key_event);

    //ホイール操作時にホバーを消す
    divElm.addEventListener('wheel', e => this.hover_off_delay());

    //他からのTABキーによるフォーカスイン時にツリー内にフォーカスを設定する
    divElm.addEventListener('focus', e => this.set_cur_focus());

    //ツリー内からフォーカスアウト時の動作
    divElm.addEventListener('focusout', e => {
      const related = e.relatedTarget as HTMLElement;
      const parent = related?.parentElement as HTMLElement;
      //ツリー内からフォーカスアウトするときにホバーを消す
      if (!parent?.classList.contains('hov')) {
        this.hover_off();
      }
    });

    // <SPAN> OP-CL <SPAN ICON></SPAN> <SPAN>TEXT</SPAN> </SPAN>
    const ev = (e: Event, f: Function) => {
      const span = e.target as HTMLElement;
      const parent = span.parentElement as HTMLElement;
      f(e, (parent.tagName == 'SPAN') ? parent : span);
    }

    //クリックイベントの動作
    divElm.addEventListener('click', e => ev(e, this.click_event));

    //ダブルクリックイベントの動作
    divElm.addEventListener('dblclick', e => ev(e, this.dblclick_event));

    //コンテキストメニューイベントの動作
    divElm.addEventListener('contextmenu', e => ev(e, this.context_event));
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
        if (this.open_close_by_keybd(elm, 'cls')) {
          this.hover_on(elm);
          const [idxs, txts] = this.index_array(elm);
          this.doLeafClose(idxs, txts);
        } else {
          //既に閉じられていた場合は上位階層へ
          const parentDivElm = elm.parentElement as HTMLDivElement;
          //最上位でなければ実行
          if (!parentDivElm.classList.contains('d')) {
            const prevSpanElm = parentDivElm.previousElementSibling as HTMLSpanElement;
            this.set_focus_by_elm(prevSpanElm);
          }
        }
        break;
      case 'ArrowRight':
        //ツリーを開く
        if (this.open_close_by_keybd(elm, 'opn')) {
          this.hover_on(elm);
          const [idxs, txts] = this.index_array(elm);
          this.doLeafOpen(idxs, txts);
        } else {
          //既に開かれていた場合は下位階層へ
          const nextDivElm = elm.nextElementSibling;
          const childSpanElm = nextDivElm?.firstElementChild as HTMLSpanElement | null;
          //下位にエレメントがあれば実行
          if (childSpanElm != null) {
            this.set_focus_by_elm(childSpanElm);
          }
        }
        break;
      case ' ':
        //スペースキーによりツリー＆リスト再取得
        elm.dispatchEvent(new Event('progress'));
        const [idxs, txts] = this.index_array(elm);
        setTimeout(() => this.doDrawList(idxs, txts));
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
   */
  private click_event = (e: MouseEvent, span: HTMLElement) => {
    if (e.detail == 1) {
      if (this.is_open_close_area(e)) {
        const aft = this.open_close_by_click(span);
        if (aft == 'opn') {
          if (span.nextElementSibling?.tagName != 'DIV') {
            span.dispatchEvent(new Event('progress'));
          }
        }
      } else {
        const [idxs, txts] = this.index_array(span);
        setTimeout(() => this.doDrawList(idxs, txts));
      }
      this.set_focus_by_elm(span);
    }
  }

  /**
   * ダブルクリックイベント処理
   * @param e マウスイベント
   */
  private dblclick_event = (e: MouseEvent, span: HTMLElement) => {
    span.focus();
    this.hover_off();
    const aft = this.open_close_by_click(span);
    if (aft != 'cls') span.dispatchEvent(new Event('progress'));
  }

  /**
   * コンテキストメニューイベント処理
   * @param e マウスイベント
   * @returns {true:有効, false:キャンセル}
   */
  private context_event = (e: MouseEvent, span: HTMLElement): boolean => {
    this.set_focus_by_elm(span);
    const [idxs, txts] = this.index_array(span);
    if (!this.doContext(idxs, txts, e)) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    return true;
  }

  //-------------------------------------------------------------------

  // エレメント作成用
  private create_span_elm = () => this.renderer.createElement('span') as HTMLSpanElement;
  private create_div_elm = () => this.renderer.createElement('div') as HTMLDivElement;

  /**
   * リーフ開閉状態文字列(クラス文字列)切り替え
   * @param elm 対象のエレメント
   * @returns リーフ状態文字列
   */
  private swap_open_close_str = (elm: HTMLElement) =>
    elm.classList.contains('cls') ? ['cls', 'opn'] : elm.classList.contains('opn') ? ['opn', 'cls'] : ['noc', 'noc'];

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
      const _icon = (aft == 'opn') ? this.i_opn : (aft == 'cls') ? this.i_cls : this.i_noc;
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
    const [bef, aft] = this.swap_open_close_str(span);
    if (mode == aft) {
      this.swap_open_close(span, bef, aft);
      this.clear_elm_list();
      if (aft == 'opn') {
        if (span.nextElementSibling?.tagName != 'DIV') {
          span.dispatchEvent(new Event('progress'));
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
   * @param hover ホバーエレメント
   * @returns 実行後のクラス文字列
   */
  private open_close_by_click(span: HTMLElement): string {
    const [bef, aft] = this.swap_open_close_str(span);
    this.swap_open_close(span, bef, aft);
    this.clear_elm_list();
    return aft;
  }

  /**
   * 開閉マーク,アイコンクリック判定
   * @param span 対象のエレメント
   * @param event イベントオブジェクト
   * @returns {true:対象, false:非対称}
   */
  private is_open_close_area(event: MouseEvent): boolean {
    let ret = false;
    const span = event.target as HTMLElement;
    const parent = span.parentElement as HTMLElement;
    if (parent.tagName != 'SPAN') {
      if (!span.classList.contains('off')) {
        const { paddingLeft: pads, backgroundPositionX: bgxs } = window.getComputedStyle(span);
        const [ofx, pad, bgx] = [event.offsetX, parseInt(pads), parseInt(bgxs)];
        if (bgx <= ofx && ofx <= pad) {
          ret = true;
        }
      }
    } else if (span.classList.contains('spc')) {
      if (parent.classList.contains('off')) ret = true;
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
      spanic.classList.value = 'spc ' + image;
      span.dataset.image = 't';
    } else {
      spanic.classList.value = this.i_cls;
    }
    spantx.innerText = text;
    span.tabIndex = -1;
    span.classList.value = 'cls';
    let pad = level + 1;
    if (this.option.no_open_close_image) {
      span.classList.add('off');
      pad--;
    }
    span.style.paddingLeft = `${pad}em`;
    span.style.backgroundPositionX = `${level}em`;
    span.dataset.index = `${idx}`;
    span.appendChild(spanic);
    span.appendChild(spantx);

    //エレメントのホバー時にホバーエレメントを作成する
    span.addEventListener('mouseenter', e => {
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
    hov_div.classList.add('hov');
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
    document.body.appendChild(hov_div);
    this.hover_elm = hov_div;

    //ホバーは数秒後に消す
    clearTimeout(this.hover_tm_off);
    this.hover_tm_off = setTimeout(() => {
      this.hover_tm_off = null;
      this.hover_off();
    }, 1500);

    //マウスが離れたときにホバーを消す
    hov_inn.addEventListener('mouseleave', e => this.hover_off());
    //ホイール操作時にホバーを消す
    hov_inn.addEventListener('wheel', e => this.hover_off_delay());
    //クリック時に開閉およびフォーカス設定
    hov_inn.addEventListener('click', e => {
      return this.click_event(e, span);
    });
    //ダブルクリック時に開閉
    hov_inn.addEventListener('dblclick', e => {
      return this.dblclick_event(e, span);
    });
    //コンテキスト時に開閉
    hov_inn.addEventListener('contextmenu', e => {
      return this.context_event(e, span);
    });
  }

  /**
   * ローディングエレメントを作成する
   * @param level エレメントの階層番号
   * @returns 作成したエレメント
   */
  private create_loading(level: number): HTMLSpanElement {
    const span = this.create_span_elm();
    span.classList.value = 'lod';
    span.innerText = 'loading...';
    span.style.paddingLeft = `${level + 1}em`;
    span.style.backgroundPositionX = `${level}em`;
    return span;
  }

  /**
   * 対象エレメントのインデックス・テキスト情報を取得する
   * @param span 対象のエレメント
   * @returns エレメントのインデックス・テキスト情報
   */
  private index_array(span: HTMLElement): [number[], string[]] {
    let idxs: number[] = [];
    let txts: string[] = [];
    for (let elm = span; !elm.classList.contains('d'); elm = elm.parentElement!) {
      const _elm = (elm.tagName == 'SPAN') ? elm : elm.previousElementSibling as HTMLElement;
      idxs.push(parseInt(_elm.dataset.index!));
      txts.push((_elm.lastElementChild as HTMLElement).innerText);
    }
    return [idxs.reverse(), txts.reverse()];
  }

  /**
   * 子階層を作成する
   * @param level エレメントの階層番号
   * @param idx 階層ごとの行番号
   * @param children リスト取得関数
   * @param span 対象のエレメント
   * @param parent 親のエレメント
   */
  private async create_subtree(level: number, children: Function, span: HTMLElement, parent: HTMLElement) {
    this.hover_off();
    // リストを作成するdivエレメントを求める
    let _div = span.nextElementSibling as HTMLElement;
    if (_div?.tagName == 'DIV') {
      while (_div.firstChild) {
        _div.removeChild(_div.firstChild);
      }
    } else {
      const _div_wk = this.create_div_elm();
      parent.insertBefore(_div_wk, _div);
      _div = _div_wk;
    }

    // ローディングエレメントを作成
    _div.appendChild(this.create_loading(level));

    // リスト取得関数を呼び出す
    const [idxs, txts] = this.index_array(span);
    let tree = await children(idxs, txts);

    // 取得したリストからエレメントを作成する
    if (tree.length > 0) {
      this.create_child(_div, tree, level + 1);
      this.swap_open_close(span, 'noc', 'opn');
    } else {
      _div.removeChild(_div.firstChild!);
      this.swap_open_close(span, 'opn', 'noc');
    }
    this.hover_on(span);
    this.clear_elm_list();
  }

  /**
   * ツリーのリーフ群を作成する
   * @param parent 親リーフ
   * @param children 子リーフ群
   * @param level エレメントの階層番号
   */
  private create_child(parent: HTMLElement, children: TYM_TREE, level: number) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    let idx = 0;
    children.forEach((l) => {
      const [tx, ch, im] = (typeof l == 'string') ? [l, ,] : (Array.isArray(l)) ? [, l,] : [l.text, l.children, l.image];
      if (tx) {
        const span = this.create_span(level, idx++, tx, im);
        parent.appendChild(span);
        if (typeof l == 'string') this.swap_open_close(span, 'cls', 'noc');
        const option = this.option;
        if (typeof option.children == 'function') {
          const children = option.children;
          span.onprogress = () => {
            this.create_subtree(level, children, span, parent);
          }
        } if (typeof ch == 'function') {
          span.onprogress = () => {
            this.create_subtree(level, ch, span, parent);
          }
        }
      }
      if (Array.isArray(ch)) {
        const prev = parent.lastElementChild as HTMLSpanElement;
        if (prev.classList.contains('noc')) {
          this.swap_open_close(prev, 'noc', 'cls');
        }
        const div = this.create_div_elm()
        parent.appendChild(div);
        this.create_child(div, ch, level + 1);
      }
    });
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
    this.cur_elm?.classList.remove('cur');
    elm.classList.add('cur');
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
}