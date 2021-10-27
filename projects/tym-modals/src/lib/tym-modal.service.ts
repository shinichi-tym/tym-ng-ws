/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Injectable, Injector, StaticProvider } from '@angular/core';
import { ComponentRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TymModalService {

  /**
   * 表示されているコンポーネント群
   */
  private components: ComponentRef<unknown>[] = [];

  /**
   * true: モーダル, false: モードレス
   */
  public modal = false;

  /**
   * コンポーネントを追加する位置のコンテナ(tym-modal.component.tsで設定)
   */
  public vcr!: ViewContainerRef;

  /**
   * コンポーネントの背景カバー要素(DIV)(tym-modal.component.tsで設定)
   */
  public cvr!: HTMLDivElement;

  /**
   * コンストラクター
   * 
   * @param {ComponentFactoryResolver} resolver コンポーネントファクトリーリゾルバ
   */
  constructor(
    private resolver: ComponentFactoryResolver
  ) { }

  /**
   * コンポーネントを作成し表示する (末尾に追加)
   * 
   * @param {any} componentType コンポーネントタイプ
   * @param {StaticProvider} provider プロバイダー
   * @param {boolean} modal true: モーダル, false: モードレス
   * @returns ComponentRef<unknown>
   */
  open(componentType: any, provider: StaticProvider, modal = true): ComponentRef<unknown> | null {
    if (!componentType) {
      return null;
    }

    const injector = Injector.create({ providers: [provider] });
    const factory = this.resolver.resolveComponentFactory(componentType);
    const component = this.vcr.createComponent(factory, this.vcr.length, injector);

    // componentが破棄された時にthis.componentsから削除し背景カバーの表示を調整する
    component.onDestroy(() => {
      const idx = this.components.findIndex(c => c.hostView.destroyed);
      this.components.splice(idx, 1);
      if (this.components.length > 0) {
        const beforeCompo = this.components[this.components.length - 1];
        const elm = beforeCompo.location.nativeElement;
        // 背景カバーの挿入or移動
        elm.parentElement!.insertBefore(this.cvr, elm);
      } else {
        // 背景カバーの削除
        this.cvr.parentElement!.removeChild(this.cvr)
      }
    });

    const element = component.location.nativeElement as HTMLElement;
    element.addEventListener('click', (e) => e.stopPropagation());
    element.addEventListener('contextmenu', (e) => e.stopPropagation());
    setTimeout(() => {
      element.tabIndex = 0;
      element.focus();
    }, 0);

    // 背景カバーの挿入or移動
    element.parentElement!.insertBefore(this.cvr, element);

    this.modal = modal;
    this.components.push(component);
    return component;
  }

  /**
   * コンポーネントを破棄し非表示にする (末尾から削除)
   */
  close(): void {
    this.components[this.components.length - 1].destroy();
  }
}