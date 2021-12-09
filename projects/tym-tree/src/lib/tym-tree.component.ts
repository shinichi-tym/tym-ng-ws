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
}

@Component({
  selector: 'ngx-tym-tree',
  template: `<div class="d"></div>`,
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

  @Input() option: TYM_TREE_OPTION = {};

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

  private i_opn: string = '';
  private i_cls: string = '';
  private i_noc: string = '';

  /**
   * 初期処理
   *
   * @memberof TymTreeComponent
   */
  ngOnInit(): void {
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
          if (this.tree_open_close(elm, 'cls')) {
            console.log('ArrowLeft close')
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
          if (this.tree_open_close(elm, 'opn')) {
            console.log('ArrowRight open')
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
          console.log('draw list')
          break;
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
  }

  //-------------------------------------------------------------------

  private hover_elm: HTMLSpanElement | null = null;
  private hover_tim: any = null;

  //-------------------------------------------------------------------

  private create_span_elm = () => this.renderer.createElement('span') as HTMLSpanElement;
  private create_div_elm = () => this.renderer.createElement('div') as HTMLDivElement;
  private swap_open_close_str = (elm: HTMLElement) =>
    elm.classList.contains('cls') ? ['cls', 'opn'] : elm.classList.contains('opn') ? ['opn', 'cls'] : ['noc', 'noc'];

  //-------------------------------------------------------------------

  private replace_icon(span: HTMLElement, bef: string, aft: string) {
    span.classList.replace(bef, aft);
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
  private tree_open_close(span: HTMLElement, mode: string): boolean {
    const [bef, aft] = this.swap_open_close_str(span);
    if (mode == aft) {
      this.replace_icon(span, bef, aft);
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
  private change_open_close(span: HTMLElement, hover: HTMLElement): string {
    const [bef, aft] = this.swap_open_close_str(span);
    this.replace_icon(span, bef, aft);
    this.replace_icon(hover, bef, aft);
    this.clear_elm_list();
    return aft;
  }

  /**
   * 開閉マークによる開閉
   * @param elm1 対象のエレメント
   * @param elm2 対象のエレメント
   * @param offset クリック位置(x)
   */
  private click_open_close(span: HTMLElement, hover: HTMLElement, target: HTMLElement, offset: number): boolean {
    let ret = false;
    const s_classList = span.classList;
    const t_classList = target.classList;
    if ((s_classList.contains('sp')) && (t_classList.contains('sp'))) {
      const ck = offset - parseInt(window.getComputedStyle(span).paddingLeft);
      if (ck >= 0 && ck <= 16) {
        ret = true;
      }
    } else if ((s_classList.contains('off')) && (t_classList.contains('spc'))) {
      ret = true;
    }
    if (ret) {
      const aft = this.change_open_close(span, hover);
      if (aft == 'opn') {
        if (span.nextElementSibling?.tagName != 'DIV') {
          span.dispatchEvent(new Event('progress'));
        }
      }
    }
    return ret;
  }

  /**
   * ホバーエレメントの削除
   */
  private hover_off() {
    if (this.hover_elm) {
      this.divElm.removeChild(this.hover_elm as HTMLSpanElement)
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
   * ホバーエレメントの作成
   * @param span 対象のエレメント
   * @returns 作成しあ
   */
  private hover_on(span: HTMLSpanElement) {
    if (this.hover_is_delay()) return;
    const baseRect = this.thisElm.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    if (baseRect.top>spanRect.top || baseRect.bottom<spanRect.bottom) return;
    const hover = span.cloneNode(true) as HTMLSpanElement;
    const style = hover.style;
    style.position = 'absolute';
    style.top = `${window.pageYOffset + spanRect.top}px`;
    style.width = `${span.scrollWidth + 2}px`;
    style.backgroundColor = '#cce';
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
      if (e.detail <= 1) {
        const target = e.target as HTMLElement;
        if (this.click_open_close(span, hover, target, e.offsetX)) {
          this.divElm.dataset.idx = this.elm_list.indexOf(span).toString();
        } else {
          console.log('draw list');
        }
      }
      this.hover_off();
      span.focus();
    });
    //ダブルクリック時に開閉
    hover.addEventListener('dblclick', e => {
      const aft = this.change_open_close(span, hover);
      if (aft != 'cls') span.dispatchEvent(new Event('progress'));
    });
  }

  /**
   * エレメントを作成する
   * @param level エレメントの階層番号
   * @param tx エレメントのテキスト
   * @returns 作成したエレメント
   */
  private create_span(index: number, level: number, text: string, image?: string): HTMLSpanElement {
    const span = this.create_span_elm();
    const spanic = this.create_span_elm();
    const spantx = this.create_span_elm();
    if (image) {
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
    span.dataset.index = `${index}`;
    span.appendChild(spanic);
    span.appendChild(spantx);

    //エレメントのホバー時にホバーエレメントを作成する
    span.addEventListener('mouseenter', e => {
      this.hover_off();
      this.hover_on(span);
    });
    return span;
  }
  private create_loading(level: number): HTMLSpanElement {
    const span = this.create_span_elm();
    span.classList.value = 'sp lod';
    span.innerText = 'loading...';
    span.style.paddingLeft = `${level}em`;
    span.style.backgroundPositionX = `${level}em`;
    return span;
  }
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

  private async create_subtree(level: number, idx: number, children: Function, span: HTMLElement, parent: HTMLElement) {
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
    _div.appendChild(this.create_loading(level));
    const [idxs, txts] = this.index_array(span);
    let tree = await children(idxs, txts);
    if (tree.length > 0) {
      this.create_child(_div, tree, level + 1);
      this.replace_icon(span, 'noc', 'opn');
    } else {
      _div.removeChild(_div.firstChild!);
      this.replace_icon(span, 'opn', 'noc');
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
        const span = this.create_span(idx, level, tx, im);
        parent.appendChild(span);
        if (typeof l == 'string') this.replace_icon(span, 'cls', 'noc');
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
          this.replace_icon(prev, 'noc', 'cls');
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