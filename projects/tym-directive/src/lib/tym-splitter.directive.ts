/*!
 * tym-directive.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, OnInit, Input, ElementRef, Renderer2, HostBinding } from '@angular/core';

@Directive({
  selector: '[tymSplitter],[tym-splitter]'
})
export class TymSplitterDirective implements OnInit {

  @Input() tymSplitter: string[] = ['#eee', '#aaa'];
  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @memberof TymSplitterDirective
   */
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
  }

  /**
   * 初期処理
   *
   * @memberof TymResizeDirective
   */
  public ngOnInit() {
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const parentElm: HTMLElement = thisElm.parentElement as any;
    const parentStyle = window.getComputedStyle(parentElm);
    const nextElm: HTMLElement = thisElm.nextElementSibling as any;
    const prevElm: HTMLElement = thisElm.previousElementSibling as any;
    const prevStyle = window.getComputedStyle(prevElm);
    const height = `calc(${parentElm.clientHeight}px - ${parentStyle.paddingTop} - ${parentStyle.paddingBottom} )`

    thisElm.style.boxSizing = 'border-box';
    prevElm.style.boxSizing = 'border-box';
    nextElm.style.boxSizing = 'border-box';

    const splitterSize = 8;
    const splitterRadius = 2;
    const splitterBackground = this.tymSplitter[0];
    const splitterBorderColor = this.tymSplitter[1];

    thisElm.style.width = `${splitterSize + 2}px`;
    thisElm.style.height = height;
    thisElm.style.position = 'absolute';
    thisElm.style.left = `calc(${prevStyle.width} + ${parentStyle.paddingLeft})`;
    thisElm.style.background = splitterBackground;
    thisElm.style.border = `solid 1px ${splitterBorderColor}`;
    thisElm.style.borderRadius = `${splitterRadius}px`;
    thisElm.style.margin = '0 1px';

    const childElm: HTMLElement = this.renderer.createElement('div');
    this.renderer.setStyle(childElm, 'width', `calc(${prevStyle.width} + ${splitterSize}px)`);
    this.renderer.setStyle(childElm, 'resize', 'horizontal');
    this.renderer.setStyle(childElm, 'overflow', 'hidden');
    this.renderer.setStyle(childElm, 'position', 'absolute');
    this.renderer.setStyle(childElm, 'height', `${parentElm.clientHeight * .5}px`);
    this.renderer.setStyle(childElm, 'left', `-${prevStyle.width}`);
    this.renderer.setStyle(childElm, 'clip-path', `inset(0 0 0 calc(${prevStyle.width} + 1px))`);
    this.renderer.appendChild(thisElm, childElm);
    const childStyle = window.getComputedStyle(childElm);

    prevElm.style.width = prevStyle.width;
    prevElm.style.height = height;
    prevElm.style.position = 'absolute';

    nextElm.style.height = height;
    nextElm.style.marginLeft = `calc(${prevStyle.width} + ${splitterSize + 4}px`;
    nextElm.style.left = '0';
    nextElm.style.right = '0';

    const childObserver = new MutationObserver(() => {
      const psw = `calc(${childStyle.width} - ${splitterSize}px)`;
      const tsl = `calc(${childStyle.width} + ${parentStyle.paddingLeft} - ${splitterSize}px)`;
      const csl = `calc(-${childStyle.width} + ${splitterSize}px)`;
      const csc = `inset(0 0 0 calc(${prevStyle.width} + 1px))`;
      const nsm = `calc(${childStyle.width} + 4px`;
      prevElm.style.width = psw;
      thisElm.style.left = tsl;
      childElm.style.left = csl;
      childElm.style.clipPath = csc;
      nextElm.style.marginLeft = nsm;
    });
    childObserver.observe(childElm, { attributes: true, attributeFilter: ["style"] });

    const parentObserver = new MutationObserver(() => {
      const height = `calc(${parentElm.clientHeight}px - ${parentStyle.paddingTop} - ${parentStyle.paddingBottom} )`
      prevElm.style.height = height;
      thisElm.style.height = height;
      childElm.style.height = `${parentElm.clientHeight * .5}px`;
      nextElm.style.height = height;
    });
    parentObserver.observe(parentElm, { attributes: true, attributeFilter: ["style"] });
  }

}
