/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, Inject, InjectionToken, StaticProvider } from '@angular/core';

export interface ButtonDef { [x: string]: Function }

@Component({
  selector: 'ngx-tym-dialog',
  templateUrl: './tym-dialog.component.html',
  styleUrls: ['./tym-dialog.component.scss']
})
export class TymDialogComponent {

  /**
   * ダイアログ用トークン
   */
  private static TYM_DIALOG_TEXT = new InjectionToken<any>('TymDialog');

  /**
  * 画面用値
  */
  public vals: any;

  /**
   * ボタンのIDと表示名の定義，利用時に定義する。
   */
  public static BUTTONS = [['close', 'CLOSE']];

  /**
   * コンストラクター
   * @param vals_ StaticProviderのuseValue値
   */
  constructor(
    @Inject(TymDialogComponent.TYM_DIALOG_TEXT) vals_: any
  ) {
    this.vals = vals_;
  }

  /**
   * StaticProviderのuseValue値の生成
   * @param title ダイアログタイトル
   * @param messages ダイアログメッセージ
   * @param button_defs ダイアログボタン定義
   * @returns ダイアログ画面用StaticProvider
   */
  public static provider(
    title: string,
    messages: string[],
    ...button_defs: ButtonDef[]
  ): StaticProvider {

    let vals: any = {};

    vals.ttl = title;
    vals.msgs = messages;

    let buttons: any[] = [];
    button_defs.forEach((bd) => {
      const id = Object.keys(bd)[0];
      let bv = TymDialogComponent.BUTTONS.find((b) => b[0] == id);
      if (bv) {
        buttons.push({ val: bv[1], act: bd[id] });
      }
    });
    vals.btns = buttons;

    return {
      provide: TymDialogComponent.TYM_DIALOG_TEXT,
      useValue: vals
    }
  }
}