/*!
 * tym-directive.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

const ABSOLUTE = 'absolute';
const STYLE = 'style';

@Directive({
  selector: '[tymSplitter],[tym-splitter]'
})
export class TymSplitterDirective implements OnInit {

  @Input() tymSplitter: string[] = ['#eee', '#aaa'];

  /**
   * コンストラクタ
   *
   * @param {ElementRef} elementRef このディレクティブがセットされたDOMへの参照
   * @param {Renderer2} renderer DOMを操作用
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
    const computedStyle = (elm: HTMLElement) => window.getComputedStyle(elm);
    const computedWidth = (elm: HTMLElement) => computedStyle(elm).width;
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const parentElm: HTMLElement = thisElm.parentElement as any;
    const { paddingTop, paddingBottom, paddingLeft } = computedStyle(parentElm);
    const nextElm: HTMLElement = thisElm.nextElementSibling as any;
    const prevElm: HTMLElement = thisElm.previousElementSibling as any;
    const prevStyleWidth = computedWidth(prevElm);
    const height = `calc(${parentElm.clientHeight}px - ${paddingTop} - ${paddingBottom} )`;

    const thisElmStyle = thisElm.style;
    const prevElmStyle = prevElm.style;
    const nextElmStyle = nextElm.style;

    thisElmStyle.boxSizing = prevElmStyle.boxSizing = nextElmStyle.boxSizing = 'border-box';

    const splitterSize = 8;
    const splitterRadius = 2;
    const splitterBackground = this.tymSplitter[0];
    const splitterBorderColor = this.tymSplitter[1];

    Object.assign(thisElmStyle, {
      width: `${splitterSize + 2}px`,
      height: height,
      position: ABSOLUTE,
      left: `calc(${prevStyleWidth} + ${paddingLeft})`,
      background: splitterBackground,
      border: `solid 1px ${splitterBorderColor}`,
      borderRadius: `${splitterRadius}px`,
      margin: '0 1px'
    } as CSSStyleDeclaration);

    const renderer = this.renderer;
    const childElm: HTMLElement = renderer.createElement('div');
    Object.assign(childElm.style, {
      width: `calc(${prevStyleWidth} + ${splitterSize}px)`,
      resize: 'horizontal',
      overflow: 'hidden',
      position: ABSOLUTE,
      height: `${parentElm.clientHeight * .5}px`,
      left: `-${prevStyleWidth}`,
      clipPath: `inset(0 0 0 calc(${prevStyleWidth} + 1px))`
    } as CSSStyleDeclaration);
    renderer.appendChild(thisElm, childElm);
    const childElmStyle = childElm.style;

    Object.assign(prevElmStyle, {
      width: prevStyleWidth,
      height: height,
      position: ABSOLUTE
    } as CSSStyleDeclaration);

    Object.assign(nextElmStyle, {
      height: height,
      marginLeft: `calc(${prevStyleWidth} + ${splitterSize + 4}px)`,
      left: '0',
      right: '0',
      position: 'relative'
    } as CSSStyleDeclaration);

    const childObserver = new MutationObserver(() => {
      const prevStyleWidth = computedWidth(prevElm);
      const childStyleWidth = computedWidth(childElm);
      [
        prevElmStyle.width,
        thisElmStyle.left,
        childElmStyle.left,
        childElmStyle.clipPath,
        nextElmStyle.marginLeft
      ] = [
        `calc(${childStyleWidth} - ${splitterSize}px)`,
        `calc(${childStyleWidth} + ${paddingLeft} - ${splitterSize}px)`,
        `calc(-${childStyleWidth} + ${splitterSize}px)`,
        `inset(0 0 0 calc(${prevStyleWidth} + 1px))`,
        `calc(${childStyleWidth} + 4px`
      ];
    });
    childObserver.observe(childElm, { attributes: true, attributeFilter: [STYLE] });

    const parentObserver = new MutationObserver(() => {
      const height = `calc(${parentElm.clientHeight}px - ${paddingTop} - ${paddingBottom})`;
      [prevElmStyle.height, thisElmStyle.height, childElmStyle.height, nextElmStyle.height] =
        [height, height, `${parentElm.clientHeight * .5}px`, height]
    });
    parentObserver.observe(parentElm, { attributes: true, attributeFilter: [STYLE] });
  }

}
