/*!
 * tym-table-editor.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Inject, InjectionToken, StaticProvider } from '@angular/core';
import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';

@Component({
  selector: 'ngx-tym-table-input',
  template: '<input [type]="vals.type" [value]="vals.val">'
})
export class TymTableInputComponent implements AfterViewInit, OnDestroy {

  /**
   * ダイアログ用トークン
   */
  private static _TYM_TABLE_INPUT_TOKEN = new InjectionToken<any>('TymTableInput');

  /**
   * 画面用値
   */
  public vals: any;
  /**
   * this native element
   */
  private _thisElm: HTMLElement;

  /**
   * コンストラクター
   * @param vals_ StaticProviderのuseValue値
   */
  constructor(
    @Inject(TymTableInputComponent._TYM_TABLE_INPUT_TOKEN) vals_: any,
    private _elmRef: ElementRef
  ) {
    this.vals = vals_;
    this._thisElm = this._elmRef.nativeElement as HTMLElement;
  }

  /**
   * ビューを初期化した後の処理
   */
  ngAfterViewInit() {
    const [thisElm, vals] = [this._thisElm, this.vals];
    const inputElm = thisElm.firstElementChild as HTMLInputElement;
    const divElm = thisElm.parentElement as HTMLDivElement; // 全画面

    Object.assign(thisElm.style, {
      top: `${vals.top}px`,
      left: `${vals.left}px`,
      position: 'absolute',
    } as CSSStyleDeclaration);

    Object.assign(inputElm.style, {
      fontSize: '150%',
    } as CSSStyleDeclaration);

    inputElm.addEventListener('keydown', event => {
      if (event.key == 'Escape') {
        vals.isEscape = true;
      }
      if (event.key == 'Enter') {
        divElm.dispatchEvent(new Event('click'));
        event.preventDefault();
      }
      if (event.key == 'Tab') {
        event.preventDefault();
      }
    });

    const resize = () => {
      const { height: div_h, width: div_w } = divElm.getBoundingClientRect();
      const { height, width, top, left } = thisElm.getBoundingClientRect();
      const thisStyle = thisElm.style;
      if ((top + height) > div_h) {
        thisStyle.top = `${div_h - height}px`;
      }
      if ((left + width) > div_w) {
        thisStyle.left = `${left - width}px`;
      }
      inputElm.focus();
    }

    // コンテキストメニューが画面外に見切れた場合に移動させる
    setTimeout(resize);
    new MutationObserver(resize)
      .observe(thisElm, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  ngOnDestroy() {
    const thisElm = this._thisElm;
    const inputElm = thisElm.firstElementChild as HTMLInputElement;
    this.vals.ret = inputElm.value;
  }

  /**
   * StaticProviderのuseValue値の生成
   * @param type input type
   * @param val 値
   * @param elm ターゲットエレメント
   * @returns ダイアログ画面用StaticProvider
   */
  public static provider(
    type: string,
    val: string,
    elm: HTMLElement
  ): StaticProvider {
    const { top, left } = elm.getBoundingClientRect();
    return {
      provide: TymTableInputComponent._TYM_TABLE_INPUT_TOKEN,
      useValue: {
        type: type,
        val: val,
        top: top,
        left: left,
      }
    }
  }
}