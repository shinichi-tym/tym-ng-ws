/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Injectable, ViewContainerRef, ComponentFactoryResolver, ComponentRef, StaticProvider, Injector, EmbeddedViewRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TymModalService {
  private component: any = null;
  public modal = false;
  public vcr!: ViewContainerRef;

  constructor(
    private resolver: ComponentFactoryResolver
  ) { }

  open(data: any, provider: StaticProvider, modal = true): ComponentRef<unknown> | null {
    if (!data) {
      return null;
    }

    const injector = Injector.create({ providers: [provider] });
    const factory = this.resolver.resolveComponentFactory(data);
    const component = this.vcr.createComponent(factory, this.vcr.length, injector);
    const element = (component.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    element.addEventListener('click', (e) => e.stopPropagation());

    if (this.component) {
      this.component.destroy();
    }

    this.modal = modal;
    this.component = component;
    return component;
  }

  close(): void {
    if (this.component) {
      this.component.destroy();
    }
  }
}