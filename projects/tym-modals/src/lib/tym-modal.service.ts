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
  private componentRefs: ComponentRef<unknown>[] = [];

  /**
   * スクロールバーのサイズ保持用
   */
  private scrollbarWidth: number = -1;
  private scrollBarFlg: boolean = true;

  /**
   * スクロール情報保持
   */
  private scrollOverflow: string = '';
  private scrollPadding: string = '';

  /**
   * true: モーダル, false: モーダレス
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
   * @param {boolean} modal true: モーダル, false: モーダレス
   * @returns ComponentRef<unknown>
   */
  public open(
    componentType: any, provider: StaticProvider, modal?: boolean
  ): ComponentRef<unknown>;
  /**
   * コンポーネントを作成し表示する (末尾に追加)
   * 
   * @param {any} componentType コンポーネントタイプ
   * @param {StaticProvider} provider プロバイダー
   * @param {boolean} modal true: モーダル, false: モーダレス
   * @param {(componentRef: ComponentRef<unknown>) => void} init コンポーネント生成時callback関数
   * @returns Promise<ComponentRef<unknown>>
   */
  public open(
    componentType: any, provider: StaticProvider, modal: boolean,
    init: (componentRef: ComponentRef<unknown>) => void
  ): Promise<ComponentRef<unknown>>;

  /**
   * コンポーネントを作成し表示する (末尾に追加)
   * 
   * @param {any} componentType コンポーネントタイプ
   * @param {StaticProvider} provider プロバイダー
   * @param {boolean} modal true: モーダル, false: モーダレス
   * @param {(componentRef: ComponentRef<unknown>) => void} init コンポーネント生成時callback関数
   * @returns ComponentRef<unknown> | Promise<ComponentRef<unknown>>
   */
  public open(
    componentType: any, provider: StaticProvider, modal = true,
    init?: (componentRef: ComponentRef<unknown>) => void
  ): ComponentRef<unknown> | Promise<ComponentRef<unknown>> {

    const compoRefs = this.componentRefs;
    const injector = Injector.create({ providers: [provider] });
    const factory = this.resolver.resolveComponentFactory(componentType);
    const componentRef = this.vcr.createComponent(factory, this.vcr.length, injector);
    const docBody = document.body;
    const bodyStyle = docBody.style;

    // componentが破棄された時にthis.componentsから削除し背景カバーの表示を調整する
    componentRef.onDestroy(() => {
      const idx = compoRefs.findIndex(c => c.hostView.destroyed);
      compoRefs.splice(idx, 1);
      if (compoRefs.length > 0) {
        const beforeCompo = compoRefs[compoRefs.length - 1];
        const elm = beforeCompo.location.nativeElement;
        // 背景カバーの挿入or移動
        elm.parentElement!.insertBefore(this.cvr, elm);
      } else {
        // 背景カバーの削除
        this.cvr.parentElement!.removeChild(this.cvr)
        // モーダル表示時にbodyスクロール抑止解除
        bodyStyle.overflow = this.scrollOverflow;
        bodyStyle.paddingRight = this.scrollPadding;
        this.scrollBarFlg = true;
      }
    });

    // モーダル表示時にbodyスクロール抑止
    if (this.scrollBarFlg) {
      const rect = document.body.getClientRects()[0];
      this.scrollbarWidth = window.innerWidth - (rect.left + rect.width + rect.right);
      this.scrollOverflow = bodyStyle.overflow;
      this.scrollPadding = bodyStyle.paddingRight;
      this.scrollBarFlg = false;
    }
    bodyStyle.overflow = 'hidden';
    bodyStyle.paddingRight = `${this.scrollbarWidth}px`;

    // イベント等調整
    const element = componentRef.location.nativeElement as HTMLElement;
    element.addEventListener('click', (e) => e.stopPropagation());
    element.addEventListener('contextmenu', (e) => e.stopPropagation());
    setTimeout(() => {
      element.tabIndex = 0;
      element.style.outline = 'none';
      element.focus();
    });

    // 背景カバーの挿入or移動
    element.parentElement!.insertBefore(this.cvr, element);

    this.modal = modal;
    compoRefs.push(componentRef);

    if (init) {
      // Promise interface
      init(componentRef);
      return new Promise((resolve, reject) => {
        componentRef.onDestroy(() => { resolve(componentRef) })
      });
    } else {
      return componentRef;
    }
  }

  /**
   * コンポーネントを破棄し非表示にする (末尾から削除)
   */
  public close(): void {
    this.componentRefs[this.componentRefs.length - 1].destroy();
  }

  /**
   * componentからcomponentRefを求める
   * 
   * @param {unknown} component コンポーネントインスタンス
   * @returns ComponentRef<unknown> | null
   */
  public getComponentRef(component: unknown): ComponentRef<unknown> | null {
    const compoRefs = this.componentRefs;
    const idx = compoRefs.findIndex(c => c.instance == component);
    return (idx < 0) ? null : compoRefs[idx]
  }
}