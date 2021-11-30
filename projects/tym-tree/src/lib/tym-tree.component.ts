/*!
 * tym-tree.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ngx-tym-tree',
  template: `<div class="d"></div>`,
  styleUrls: ['./tym-tree.component.scss']
})
export class TymTreeComponent implements OnInit {

  /**
   * this native element
   */
  private thisElm: HTMLElement;
  private divElm!: HTMLDivElement;

  @Input() tree: any[] = [];

  /**
   * コンストラクター
   * 
   * @param {ElementRef} elementRef このコンポーネントがセットされたDOMへの参照
   * @param {Renderer2} renderer DOMを操作用
   * @param {TymModalService} modal モーダルサービス
   * @memberof TymModalComponent
   */
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.thisElm = this.elementRef.nativeElement;
  }

  private create_elm = (elm: string) => this.renderer.createElement('span') as HTMLElement;

  private create_span(level: number, tx: string): HTMLSpanElement {
    const span = this.create_elm('span');
    const spantx = this.create_elm('span');
    span.tabIndex = -1;
    span.classList.add('cls');
    span.style.paddingLeft = `${level}em`;
    span.style.backgroundPositionX = `${level}em`;
    spantx.classList.value = '';
    spantx.innerText = tx;
    span.appendChild(spantx);
    return span;
  }

  private create_child(parent: HTMLElement, children: any[], level: number) {
    children.forEach(l => {
      parent.appendChild(this.create_span(level, l.tx));
      if (l.children) {
        const div = this.renderer.createElement('div') as HTMLDivElement;
        parent.appendChild(div);
        this.create_child(div, l.children, level + 1);
      }
    });
  }

  private change_focus(elms: NodeListOf<HTMLElement>, idx: number) {
    if (elms.length <= idx || idx < 0) return;
    elms[idx].focus();
    this.divElm.dataset.idx = idx.toString();
  }

  private change_open_close(elm: HTMLElement, doOpen: boolean): boolean {
    const nowOpen = elm.classList.contains('opn');
    const [bef, aft] = (doOpen) ? ['cls', 'opn'] : ['opn', 'cls'];
    elm.classList.replace(bef, aft);
    return (nowOpen != doOpen);
  }

  private get_elm_list = (elm: HTMLElement) =>
    elm.querySelectorAll('div>span:not(.cls+div span)') as NodeListOf<HTMLElement>;

  ngOnInit(): void {
    const divElm = this.thisElm.firstElementChild as HTMLDivElement;
    this.divElm = divElm;
    this.create_child(divElm, this.tree, 0);
    divElm.addEventListener('keydown', e => {
      const elm = e.target as HTMLElement;
      const elms = this.get_elm_list(divElm);
      let idx = Array.from(elms).indexOf(elm);
      switch (e.key) {
        case 'ArrowDown':
          this.change_focus(elms, idx + 1);
          console.log(e);
          break;
        case 'ArrowUp':
          this.change_focus(elms, idx - 1);
          console.log(e);
          break;
        case 'ArrowLeft':
          if (this.change_open_close(elm, false)) {
            console.log('ArrowLeft close')
          }
          console.log(e);
          break;
        case 'ArrowRight':
          if (this.change_open_close(elm, true)) {
            console.log('ArrowRight open')
          }
          console.log(e);
          break;
        case ' ':
          console.log(e);
          break;

        default:
          return;
          break;
      }
      e.preventDefault();
    });
    divElm.addEventListener('click', e => {
      const elm = e.target as HTMLElement;
      console.log(e)
      if (elm.tagName != 'SPAN') return;
      const elms = this.get_elm_list(divElm);
      let idx = Array.from(elms).indexOf(elm);
      divElm.dataset.idx = idx.toString();
    });
    divElm.addEventListener('dblclick', e => {
      const elm = e.target as HTMLElement;
      if (elm.tagName != 'SPAN') return;
      if (elm.classList.contains('cls')) {
        elm.classList.replace('cls', 'opn');
      } else {
        elm.classList.replace('opn', 'cls');
      }
      const elms = this.get_elm_list(divElm);
      let idx = Array.from(elms).indexOf(elm);
    });
  }

}
