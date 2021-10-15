/*!
 * tym-directive.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tymSplitter],[tym-splitter]'
})
export class TymSplitterDirective implements OnInit {

  @Input() tymSplitter: string[] = ['#eee', '#aaa'];

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @param {Renderer2} render DOMを操作用
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
   * @memberof TymSplitterDirective
   */
  public ngOnInit() {
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const parentElm: HTMLElement = thisElm.parentElement as any;
    const parentStyle = window.getComputedStyle(parentElm);
    const nextElm: HTMLElement = thisElm.nextElementSibling as any;
    const prevElm: HTMLElement = thisElm.previousElementSibling as any;
    const prevStyle = window.getComputedStyle(prevElm);
    const height = `calc(${parentElm.clientHeight}px - ${parentStyle.paddingTop} - ${parentStyle.paddingBottom} )`;

    const thisElmStyle = thisElm.style;
    const prevElmStyle = prevElm.style;
    const nextElmStyle = nextElm.style;

    thisElmStyle.boxSizing = prevElmStyle.boxSizing = nextElmStyle.boxSizing = 'border-box';

    const splitterSize = 8;
    const splitterRadius = 2;
    const splitterBackground = this.tymSplitter[0];
    const splitterBorderColor = this.tymSplitter[1];

    thisElmStyle.width = `${splitterSize + 2}px`;
    thisElmStyle.height = height;
    thisElmStyle.position = 'absolute';
    thisElmStyle.left = `calc(${prevStyle.width} + ${parentStyle.paddingLeft})`;
    thisElmStyle.background = splitterBackground;
    thisElmStyle.border = `solid 1px ${splitterBorderColor}`;
    thisElmStyle.borderRadius = `${splitterRadius}px`;
    thisElmStyle.margin = '0 1px';

    const renderer = this.renderer;
    const childElm: HTMLElement = renderer.createElement('div');
    renderer.setStyle(childElm, 'width', `calc(${prevStyle.width} + ${splitterSize}px)`);
    renderer.setStyle(childElm, 'resize', 'horizontal');
    renderer.setStyle(childElm, 'overflow', 'hidden');
    renderer.setStyle(childElm, 'position', 'absolute');
    renderer.setStyle(childElm, 'height', `${parentElm.clientHeight * .5}px`);
    renderer.setStyle(childElm, 'left', `-${prevStyle.width}`);
    renderer.setStyle(childElm, 'clip-path', `inset(0 0 0 calc(${prevStyle.width} + 1px))`);
    renderer.appendChild(thisElm, childElm);
    const childElmStyle = childElm.style;
    const childStyle = window.getComputedStyle(childElm);

    prevElmStyle.width = prevStyle.width;
    prevElmStyle.height = height;
    prevElmStyle.position = 'absolute';

    nextElmStyle.height = height;
    nextElmStyle.marginLeft = `calc(${prevStyle.width} + ${splitterSize + 4}px`;
    nextElmStyle.left = '0';
    nextElmStyle.right = '0';
    nextElmStyle.position = 'relative';

    const childObserver = new MutationObserver(() => {
      const psw = `calc(${childStyle.width} - ${splitterSize}px)`;
      const tsl = `calc(${childStyle.width} + ${parentStyle.paddingLeft} - ${splitterSize}px)`;
      const csl = `calc(-${childStyle.width} + ${splitterSize}px)`;
      const csc = `inset(0 0 0 calc(${prevStyle.width} + 1px))`;
      const nsm = `calc(${childStyle.width} + 4px`;
      prevElmStyle.width = psw;
      thisElmStyle.left = tsl;
      childElmStyle.left = csl;
      childElmStyle.clipPath = csc;
      nextElmStyle.marginLeft = nsm;
    });
    childObserver.observe(childElm, { attributes: true, attributeFilter: ["style"] });

    const parentObserver = new MutationObserver(() => {
      const height = `calc(${parentElm.clientHeight}px - ${parentStyle.paddingTop} - ${parentStyle.paddingBottom} )`
      prevElmStyle.height = height;
      thisElmStyle.height = height;
      childElmStyle.height = `${parentElm.clientHeight * .5}px`;
      nextElmStyle.height = height;
    });
    parentObserver.observe(parentElm, { attributes: true, attributeFilter: ["style"] });
  }

}
