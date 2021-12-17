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
  private doContext = (indexs: number[], texts: string[], event: MouseEvent) => {return true};

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
    divElm.addEventListener('keydown', e => {
      const elm = e.target as HTMLElement;
      const elms = this.elm_list;
      let idx = elms.indexOf(elm);
      switch (e.key) {
        case 'ArrowDown':
          //フォーカスを一つ下へ
          this.change_focus(elms, idx + 1);
          break;
        case 'ArrowUp':
          //フォーカスを一つ上へ
          this.change_focus(elms, idx - 1);
          break;
        case 'ArrowLeft':
          //ツリーを閉じる
          if (this.open_close_by_keybd(elm, 'cls')) {
            const [idxs, txts] = this.index_array(elm);
            this.doLeafClose(idxs, txts);
          } else {
            //既に閉じられていた場合は上位階層へ
            const parentDivElm = elm.parentElement as HTMLDivElement;
            //最上位でなければ実行
            if (!parentDivElm.classList.contains('d')) {
              const prevSpanElm = parentDivElm.previousElementSibling as HTMLSpanElement;
              this.change_focus(elms, elms.indexOf(prevSpanElm));
            }
          }
          break;
        case 'ArrowRight':
          //ツリーを開く
          if (this.open_close_by_keybd(elm, 'opn')) {
            const [idxs, txts] = this.index_array(elm);
            this.doLeafOpen(idxs, txts);
          } else {
            //既に開かれていた場合は下位階層へ
            const nextDivElm = elm.nextElementSibling;
            const childSpanElm = nextDivElm?.firstElementChild as HTMLSpanElement | null;
            //下位にエレメントがあれば実行
            if (childSpanElm != null) {
              this.change_focus(elms, elms.indexOf(childSpanElm));
            }
          }
          break;
        case ' ':
          elm.dispatchEvent(new Event('progress'));
          const [idxs, txts] = this.index_array(elm);
          setTimeout(() => this.doDrawList(idxs, txts));
          break;
        case 'Tab':
          if (e.shiftKey) {
            divElm.tabIndex = -1;
            setTimeout(() => divElm.tabIndex = 0);
          }
          return;
        default:
          return;
      }
      // キーボード操作中にホバー処理を中断する
      this.hover_off();
      //処理済みのキーボード操作をキャンセルする
      e.preventDefault();
    });
    //ホイール操作時にホバーを消す
    divElm.addEventListener('wheel', e => this.hover_off());
    divElm.addEventListener('mouseleave', e => this.hover_off());
    divElm.addEventListener('focus', (e:FocusEvent) => {
      const idx = parseInt(divElm.dataset.idx || "0");
      this.change_focus(this.elm_list, idx);
    });
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
  private open_close_by_click(span: HTMLElement, hover: HTMLElement): string {
    const [bef, aft] = this.swap_open_close_str(span);
    this.swap_open_close(span, bef, aft);
    this.swap_open_close(hover, bef, aft);
    this.clear_elm_list();
    return aft;
  }

  /**
   * 開閉マーク,アイコンクリック判定
   * @param span 対象のエレメント
   * @param event イベントオブジェクト
   * @returns {true:対象, false:非対称}
   */
  private is_open_close_area(span: HTMLElement, event: MouseEvent): boolean {
    let ret = false;
    const { target: target, offsetX: offset } = event;
    const s_classList = span.classList;
    const t_classList = (target as HTMLElement).classList;
    if ((s_classList.contains('sp')) && (t_classList.contains('sp'))) {
      const ck = offset - parseInt(window.getComputedStyle(span).paddingLeft);
      const sz = parseInt(window.getComputedStyle(span, "::before").marginLeft);
      if (0 <= ck && ck <= sz) {
        ret = true;
      }
    } else if ((s_classList.contains('off')) && (t_classList.contains('spc'))) {
      ret = true;
    }
    return ret;
  }

  //-------------------------------------------------------------------

  // ホバーエレメント保持用 / ホバー非表示タイミング
  private hover_elm: HTMLSpanElement | null = null;
  private hover_tim: any = null;

  /**
   * ホバーエレメントの削除
   */
  private hover_off() {
    if (this.hover_elm) {
      this.divElm.removeChild(this.hover_elm as HTMLSpanElement);
      this.hover_elm = null;
    }
  }

  /**
   * ホバーエレメントの削除(削除後再表示の遅延あり)
   */
  private hover_off_delay() {
    this.hover_off();
    clearTimeout(this.hover_tim);
    this.hover_tim = setTimeout(() => {
      this.hover_tim = null;
    }, 400);
  }

  /**
   * ホバーエレメントの表示遅延中状態
   * @returns {true:遅延中,false:遅延中ではない}
   */
  private hover_is_delay = () => this.hover_tim != null;

  /**
   * 相対座標対象のparentエレメント
   * @param elm 対象のエレメント
   * @returns 取得したエレメント | null
   */
  parentElm(elm: HTMLElement): HTMLElement | null {
    const posfx = ['absolute', 'relative', 'fixed'];
    do {
      if (posfx.indexOf(elm.style.position) >= 0) break;
    } while (elm = elm.offsetParent as HTMLElement);
    return elm;
  }

  /**
   * ホバーエレメントの作成
   * @param span 対象のエレメント
   */
  private hover_on(span: HTMLSpanElement) {
    if (this.hover_is_delay()) return;
    const { top: base_t, bottom: base_b } = this.thisElm.getBoundingClientRect();
    const { top: span_t, bottom: span_b, width: span_w } = span.getBoundingClientRect();
    const offelm = this.parentElm(span);
    if (Math.floor(base_t) > Math.floor(span_t) || Math.floor(base_b) < Math.floor(span_b)) return;
    const hover = span.cloneNode(true) as HTMLSpanElement;
    hover.classList.add('hov');
    if (offelm) {
      const bw = parseFloat(window.getComputedStyle(offelm).borderWidth);
      const top = span_t - offelm.getBoundingClientRect().top - bw;
      Object.assign(hover.style, {
        width: `${span_w}px`,
        top: `${top + offelm.scrollTop}px`,
        overflowX: 'hidden',
      });
      if (span.scrollWidth > span_w) hover.title = span.innerText;
    } else {
      Object.assign(hover.style, {
        width: `${span.scrollWidth}px`,
        top: `${window.pageYOffset + span_t}px`,
      });
    }
    this.divElm.appendChild(hover);
    this.hover_elm = hover;

    //マウスが離れたときにホバーを消す
    hover.addEventListener('mouseleave', e => {
      this.hover_off();
    });
    //ホイール操作時にホバーを消す
    hover.addEventListener('wheel', e => {
      this.hover_off_delay();
    });
    //クリック時に開閉およびフォーカス設定
    hover.addEventListener('click', e => {
      if (e.detail == 1) {
        if (this.is_open_close_area(span, e)) {
          const aft = this.open_close_by_click(span, hover);
          if (aft == 'opn') {
            if (span.nextElementSibling?.tagName != 'DIV') {
              span.dispatchEvent(new Event('progress'));
            }
          }
        } else {
          const [idxs, txts] = this.index_array(span);
          setTimeout(() => this.doDrawList(idxs, txts));
        }
        this.divElm.dataset.idx = this.elm_list.indexOf(span).toString();
      }
      this.hover_off();
      span.focus();
    });
    //ダブルクリック時に開閉
    hover.addEventListener('dblclick', e => {
      const aft = this.open_close_by_click(span, hover);
      if (aft != 'cls') span.dispatchEvent(new Event('progress'));
    });
    //ダブルクリック時に開閉
    hover.addEventListener('contextmenu', e => {
      const [idxs, txts] = this.index_array(span);
      if (!this.doContext(idxs, txts, e)) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      return true;
    });
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
    if (this.option.no_open_close_image) {
      span.classList.add('off');
    } else {
      span.classList.add('sp');
    }
    span.style.paddingLeft = `${level}em`;
    span.style.backgroundPositionX = `${level}em`;
    span.dataset.index = `${idx}`;
    span.appendChild(spanic);
    span.appendChild(spantx);

    //エレメントのホバー時にホバーエレメントを作成する
    span.addEventListener('mouseenter', e => {
      this.hover_off();
      this.hover_on(span);
    });
    return span;
  }

  /**
   * ローディングエレメントを作成する
   * @param level エレメントの階層番号
   * @returns 作成したエレメント
   */
  private create_loading(level: number): HTMLSpanElement {
    const span = this.create_span_elm();
    span.classList.value = 'sp lod';
    span.innerText = 'loading...';
    span.style.paddingLeft = `${level}em`;
    span.style.backgroundPositionX = `${level}em`;
    return span;
  }

  /**
   * 対象エレメントのインデックス・テキスト情報を取得する
   * @param span 対象のエレメント
   * @returns エレメントのインデックス・テキスト情報
   */
  private index_array(span: HTMLElement): [number[],string[]] {
    let idxs: number[] = [];
    let txts: string[] = [];
    for (let elm = span; !elm.classList.contains('d'); elm = elm.parentElement!) {
      const _elm = (elm.tagName == 'SPAN') ? elm : elm.previousElementSibling as HTMLElement;
      idxs.push(parseInt(_elm.dataset.index!));
      txts.push((_elm.lastElementChild as HTMLElement).innerText);
    }
    return [idxs.reverse(),txts.reverse()];
  }

  /**
   * 子階層を作成する
   * @param level エレメントの階層番号
   * @param idx 階層ごとの行番号
   * @param children リスト取得関数
   * @param span 対象のエレメント
   * @param parent 親のエレメント
   */
  private async create_subtree(level: number, idx: number, children: Function, span: HTMLElement, parent: HTMLElement) {
    // リストを作成するdivエレメントを求める
    let _div = span.nextElementSibling as HTMLElement;
    if (_div?.tagName == 'DIV') {
      while (_div.firstChild) {
        _div.removeChild(_div.firstChild);
      }
    } else {
      const _div_wk = this.create_div_elm();
      _div_wk.dataset.index = `${idx}`;
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
    this.hover_off();
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
    children.forEach((l, idx) => {
      const [tx, ch, im] = (typeof l == 'string') ? [l, ,] : (Array.isArray(l)) ? [, l,] : [l.text, l.children, l.image];
      if (tx) {
        const span = this.create_span(level, idx, tx, im);
        parent.appendChild(span);
        if (typeof l == 'string') this.swap_open_close(span, 'cls', 'noc');
        const option = this.option;
        if (typeof option.children == 'function') {
          const children = option.children;
          span.onprogress = () => {
            this.create_subtree(level, idx, children, span, parent);
          }
        } if (typeof ch == 'function') {
          span.onprogress = () => {
            this.create_subtree(level, idx, ch, span, parent);
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

  /**
   * フォーカス位置を変更(設定)する
   * @param elms 表示されているエレメントリスト
   * @param idx 設定するフォーカスの位置
   */
  private change_focus(elms: HTMLElement[], idx: number) {
    if (elms.length > idx && idx >= 0) {
      elms[idx].focus();
      this.divElm.dataset.idx = idx.toString();
    }
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