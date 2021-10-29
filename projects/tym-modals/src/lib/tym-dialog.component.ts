/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Inject, InjectionToken, StaticProvider } from '@angular/core';
import { Component } from '@angular/core';

export interface ButtonDefs { [x: string]: Function }

@Component({
  selector: 'ngx-tym-dialog',
  templateUrl: './tym-dialog.component.html',
  styleUrls: ['./tym-dialog.component.scss']
})
export class TymDialogComponent {

  /**
   * ダイアログ用トークン
   */
  private static TYM_DIALOG_TOKEN = new InjectionToken<any>('TymDialog');

  /**
   * 画面用値
   */
  public vals: any;

  /**
   * 選択されたボタンのID
   */
  public actionId: string = '';

  /**
   * ボタンのIDと表示名の定義，利用時に定義する。
   */
  public static BUTTONS = [['close', 'CLOSE']];

  /**
   * コンストラクター
   * @param vals_ StaticProviderのuseValue値
   */
  constructor(
    @Inject(TymDialogComponent.TYM_DIALOG_TOKEN) vals_: any
  ) {
    this.vals = vals_;
  }

  /**
   * ボタンクリック時の関数
   * @param {string} id ボタンのID
   * @private @access private
   */
  public onC(btn: { id: string, val: string, act: Function }) {
    this.actionId = btn.id;
    btn.act(this);
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
    button_defs: ButtonDefs = {}
  ): StaticProvider {

    let buttons: any[] = [];
    Object.keys(button_defs).forEach((id) => {
      const act = button_defs[id];
      let bv = TymDialogComponent.BUTTONS.find((b) => b[0] == id);
      if (bv) {
        buttons.push({ id: id, val: bv[1], act: act });
      }
    });

    return {
      provide: TymDialogComponent.TYM_DIALOG_TOKEN,
      useValue: {
        title: title,
        messages: messages,
        btns: buttons
      }
    }
  }
}