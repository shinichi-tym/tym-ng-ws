/*!
 * tym-modals.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Inject, InjectionToken, StaticProvider } from '@angular/core';
import { Component, AfterViewInit, HostListener, ElementRef } from '@angular/core';

const OPN = 'opn';
const CLS = 'cls';
const NOD = 'nod';
const SPC = ' spc';
const SPSPC = 'sp' + SPC;

export type MenuDefs = { [gid: string]: { [id: string]: string | [string, string] } };
export type MenuItems = [...[string, boolean][]][];
export type IconItems = [...[string, string]][];
export type MenuAction = (group: string, item: string) => void;

@Component({
  selector: 'ngx-tym-menu',
  templateUrl: './tym-menu.component.html',
  styleUrls: ['./tym-menu.component.scss']
})
export class TymMenuComponent implements AfterViewInit {

  /**
   * 背景右クリック時にmodalを閉じる
   */
  @HostListener('contextmenu') contextmenu() { this.close(); return false; }

  /**
   * windowリサイズ時にmodalを閉じる
   */
  @HostListener('window:resize') resize() { this.close(); }

  /**
   * メニュー用トークン
   */
  private static TYM_MENU_TOKEN = new InjectionToken<any>('TymMenu');

  /**
   * 画面用値
   */
  public vals: any;

  /**
   * 選択されたボタンのID
   */
  public groupId: string = '';

  /**
   * 選択されたボタンのID
   */
  public itemId: string = '';

  /**
   * this native element
   */
  private thisElm: HTMLElement;

  /**
   * 全てのメニュー項目を事前に定義しておく。
   * {<group-id>: {
   *   '':<group-name>,
   *   <id>: <name>,
   *   ...}...}
   */
  public static MENU_DEFS: MenuDefs = {
    'file': {
      '':'ファイル',
      'copy': 'コピー',
      'remove': '削除',
    },
    'folder': {
      '':'フォルダー',
      'copy': 'コピー',
      'remove': '削除',
    },
  };

  /**
   * 表示するメニューを指定する。
   * [[[<group-id>, {false:show separator, true:show sub menu}],
   *    [<id>, {false:disable, true:enable}], ...], ...]
   */
  // public static MENU: MenuItem = [
  //   [['file', false],
  //     ['copy', true], ['remove', false]],
  //   [['folder', false],
  //     ['copy', true], ['remove', false]],
  // ];

  /**
   * 表示するアイコングループを指定する。
   * [[<group-id>, <id>], ...]
   */
  // public static ICON: IconItems = [
  //   ['file', 'copy'], ['file','remove']
  // ];

  /**
   * コンストラクター
   * @param vals_ StaticProviderのuseValue値
   */
  constructor(
    @Inject(TymMenuComponent.TYM_MENU_TOKEN) vals_: any,
    private elementRef: ElementRef
  ) {
    this.vals = vals_;
    this.thisElm = this.elementRef.nativeElement as HTMLElement;
  }

  /**
   * ビューを初期化した後の処理
   */
  ngAfterViewInit() {
    const thisElm = this.thisElm;
    const divElm = thisElm.parentElement as HTMLDivElement; // 全画面
    const [thisElmStyle, vals] = [thisElm.style, this.vals];
    [thisElmStyle.top, thisElmStyle.left] = [`${vals.screenY}px`, `${vals.screenX}px`];

    const resize = () => {
      const { height: div_h, width: div_w } = divElm.getBoundingClientRect();
      const { height, width, top, left } = thisElm.getBoundingClientRect();
      if ((top + height) > div_h) {
        thisElmStyle.top = `${div_h - height}px`;
      }
      if ((left + width) > div_w) {
        thisElmStyle.left = `${left - width}px`;
      }
    }

    // コンテキストメニューが画面外に見切れた場合に移動させる
    setTimeout(resize);
    new MutationObserver(resize)
      .observe(thisElm, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  /**
   * クローズ
   */
  private close() {
    const parentElm = this.thisElm.parentElement as HTMLElement;
    parentElm.dispatchEvent(new Event('click'));
  }

  /**
   * menuAction
   */
  public ma(item: any) {
    [this.groupId, this.itemId] = [item.gid, item.id];
    if (item.act) {
      // item click action
      if (item.fg) {
        this.close();
        item.act(item.gid, item.id);
      }
    } else {
      // group open and close action
      const ulElm = this.thisElm.firstElementChild as HTMLUListElement;
      let grouptop = true;
      for (let index = 0; index < ulElm.children.length; index++) {
        const liElm = ulElm.children[index] as HTMLElement;
        const { classList, dataset } = liElm;
        if (item.gid == dataset.gid) {
          if (grouptop) {
            const [P, Q] = classList.contains(CLS) ? [CLS, OPN] : [OPN, CLS];
            classList.replace(P, Q);
            grouptop = false;
          } else {
            if (classList.contains(NOD)) {
              classList.remove(NOD)
            } else {
              classList.add(NOD)
            }
          }
        }
      }
    }
  }

  /**
   * StaticProviderのuseValue値の生成
   * @param menuItem メニュー項目
   * @param menuAction メニューアクション関数
   * @param screenX x座標
   * @param screenY y座標
   * @param iconItem アイコンデータ
   * @returns メニュー用StaticProvider
   */
  public static provider(
    menuItem: MenuItems,
    menuAction: MenuAction,
    screenX: number,
    screenY: number,
    iconItem: IconItems = [],
  ): StaticProvider {

    let items: any = [];
    let icons: any = [];
    const menuDef = TymMenuComponent.MENU_DEFS;

    // MENU_DEFS にアイコンが定義されているか調べる
    let useItemIcon = false;
    Object.keys(menuDef).forEach(k => {
      Object.keys(menuDef[k]).forEach(i => {
        if (typeof menuDef[k][i] !== 'string') useItemIcon = true;
      })
    });

    // アイコングループ表示用のデータを作成する
    iconItem.forEach((ii, ix) => {
      const [gid, id] = ii;
      const ni = menuDef[gid][id];
      if (typeof ni !== 'string') {
        const [nm, ic] = ni;
        icons.push({ cls: '', gid: gid, id: id, nm: nm, ic: ic, fg: true, act: menuAction });
      }
    });
    const useIcons = icons.length != 0;

    // メニュー表示用のデータを作成する
    menuItem.forEach((ims, ixs) => {
      let gid: string, gfg: boolean;
      let gnm: string, gic: string, gni: string | [string, string];
      ims.forEach((im, ix) => {
        if (ix == 0) {
          // group data
          [gid, gfg] = ims[0];
          gni = menuDef[gid][''];
          [gnm, gic] = (typeof gni === 'string') ? [gni, ''] : gni;
          if (useItemIcon) {
            gic += (gic == '') ? SPSPC : SPC;
          }
          if (gfg) {
            // group:sub menu
            items.push({ cls: CLS, gid: gid, id: '', nm: gnm, ic: gic });
          } else if (ixs > 0) {
            // group:separator
            items.push({ cls: 'hr', gid: gid, id: '', nm: '', ic: '' });
          } else {
            // not show:1st separator
          }
        } else {
          // item data
          const [id, fg] = im;
          const ni = menuDef[gid][id];
          let [nm, ic] = (typeof ni === 'string') ? [ni, ''] : ni;
          const cls = `itm${(gfg) ? ` ${NOD} idt` : ''}${(fg) ? '' : ' dis'}`;
          if (useItemIcon) {
            ic += (ic == '') ? SPSPC : SPC;
          }
          items.push({ cls: cls, gid: gid, id: id, nm: nm, ic: ic, fg: fg, act: menuAction });
        }
      });
    });

    return {
      provide: TymMenuComponent.TYM_MENU_TOKEN,
      useValue: {
        items: items,
        icons: icons,
        screenX: screenX,
        screenY: screenY,
        useIcons: useIcons
      }
    }
  }
}