/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Inject, InjectionToken, StaticProvider } from '@angular/core';
import { Component, AfterViewInit, HostListener, ElementRef } from '@angular/core';

export type MenuDefs = { [gid: string]: { [id: string]: string } };
export type MenuItems = [...[string, boolean][]][];
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
    const ulElm = this.thisElm.firstElementChild as HTMLUListElement;
    const divElm = this.thisElm.parentElement as HTMLDivElement;
    const [ulElmStyle, vals] = [ulElm.style, this.vals];
    [ulElmStyle.top, ulElmStyle.left] = [`${vals.screenY}px`, `${vals.screenX}px`];

    const resize = () => {
      const ulRect = ulElm.getBoundingClientRect();
      const divRect = divElm.getBoundingClientRect();
      if ((ulRect.top + ulRect.height) > divRect.height) {
        ulElmStyle.top = `${divRect.height - ulRect.height}px`;
      }
      if ((ulRect.left + ulRect.width) > divRect.width) {
        ulElmStyle.left = `${ulRect.left - ulRect.width}px`;
      }
    }

    // コンテキストメニューが画面外に見切れた場合に移動させる
    setTimeout(resize, 0);
    new MutationObserver(resize)
      .observe(ulElm, { subtree: true, attributes: true, attributeFilter: ["class"] });
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
    if (item.act) {
      // item click action
      if (item.fg) {
        this.close();
        item.act(item.gid, item.id);
      }
    } else {
      // group open and close action
      const ulElm = this.thisElm.firstChild as HTMLUListElement;
      for (let index = 0; index < ulElm.children.length; index++) {
        const element = ulElm.children[index] as HTMLElement;
        const classList = element.classList;
        if (item.gid == element.dataset.gid) {
          if (index == 0) {
            if (classList.contains('cls')) {
              classList.replace('cls', 'opn');
            } else {
              classList.replace('opn', 'cls');
            }
          } else {
            if (classList.contains('nod')) {
              classList.remove('nod')
            } else {
              classList.add('nod')
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
   * @returns メニュー用StaticProvider
   */
  public static provider(
    menuItem: MenuItems,
    menuAction: MenuAction,
    screenX: number,
    screenY: number
  ): StaticProvider {

    let items: any = [];
    const [menuDef, menu] = [TymMenuComponent.MENU_DEFS, menuItem];

    menu.forEach((ims, ixs) => {
      let gid: string, gfg: boolean, gnm: string;
      ims.forEach((im, ix) => {
        if (ix == 0) {
          // group data
          [gid, gfg] = ims[0];
          gnm = menuDef[gid][''];
          if (gfg) {
            // group:sub menu
            items.push({ cls: 'cls', gid: gid, id: '', nm: gnm });
          } else if (ixs > 0) {
            // group:separator
            items.push({ cls: 'hr', gid: gid, id: '', nm: '' });
          } else {
            // not show:1st separator
          }
        } else {
          // item data
          const [id, fg] = im;
          const nm = menuDef[gid][id];
          const cls = `itm${(gfg) ? ' nod idt' : ''}${(fg) ? '' : ' dis'}`;
          items.push({ cls: cls, gid: gid, id: id, nm: nm, fg: fg, act: menuAction });
        }
      });
    });

    return {
      provide: TymMenuComponent.TYM_MENU_TOKEN,
      useValue: {
        items: items,
        screenX: screenX,
        screenY: screenY
      }
    }
  }
}