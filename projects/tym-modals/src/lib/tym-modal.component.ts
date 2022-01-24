/*!
 * tym-modals.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { ViewChild, ViewContainerRef } from '@angular/core';
import { TymModalService } from './tym-modal.service';

const FOCUSIN = 'focusin';
const KEYUP = 'keyup';
const KEYDOWN = 'keydown';

@Component({
  selector: 'npx-tym-modals,ngx-tym-modals',
  template:
    `<div class="bg" (click)="bgC()" (contextmenu)="bgM()" [style.display]="display">`
    + `<div #c></div></div>`,
  styleUrls: ['./tym-modal.component.scss']
})
export class TymModalComponent implements OnInit, AfterViewInit {

  /**
   * モーダルサービスで利用するViewContainerRef
   */
  @ViewChild('c', { read: ViewContainerRef }) vcr: any;

  /**
   * 全画面ラッパー表示・非表示用
   */
  public display = 'none';

  /**
   * this native element
   */
  private thisElm: HTMLElement;

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
    private renderer: Renderer2,
    private modal: TymModalService
  ) {
    this.thisElm = this.elementRef.nativeElement;
  }

  /**
   * 初期処理
   */
  ngOnInit(): void {
    const divElm = this.thisElm.firstElementChild as HTMLDivElement;
    const keyup = (event: any) => {
      if (event.keyCode == 27) { // Escape Key
        this.modalClose();
      }
    }
    /**
     * コンポーネントが追加されるとmodal配下を表示し
     * コンポーネントが全てなくなるとmodal配下を非表示にする。
     * ESCキーのイベントを登録・解除する。
     */
    const observer = new MutationObserver(() => {
      if (divElm.childElementCount > 1) {
        this.display = ''; // show modal
        document.addEventListener(KEYUP, keyup, false);
      } else {
        this.display = 'none'; // hide modal
        document.removeEventListener(KEYUP, keyup, false);
      }
    });
    observer.observe(divElm, { childList: true });
  }

  private createElm = (t: string) => this.renderer.createElement(t) as HTMLElement;
  private createSpanElm = () => this.createElm('span');

  /**
   * ビューを初期化した後の処理
   */
  ngAfterViewInit() {
    const vcr = this.vcr;
    const cvr = this.createElm('div');
    cvr.tabIndex = 0;
    const fin = this.createSpanElm();
    fin.tabIndex = 1;
    const fot = this.createSpanElm();
    fot.tabIndex = 0;
    const span = this.createSpanElm();
    span.tabIndex = 0;

    cvr.classList.value = 'cv';
    cvr.addEventListener(KEYDOWN, e => {
      if (e.key == 'Tab' && e.shiftKey) span.focus();
    });

    const fcs = () => cvr.focus();
    fin.addEventListener(FOCUSIN, fcs);
    fot.addEventListener(FOCUSIN, fcs);
    span.addEventListener(FOCUSIN, e => {
      if (e.relatedTarget != cvr) cvr.focus();
    });
    span.addEventListener(KEYDOWN, fcs)

    this.thisElm.appendChild(span);
    const modal = this.modal;
    modal.vcr = vcr;
    modal.fin = fin;
    modal.fot = fot;
    modal.cvr = cvr;
  }

  /**
   * modalを閉じる
   */
  close() {
    this.modal.close();
  }

  /**
   * 背景をクリック時にmodalを閉じる
   * @private @access private
   */
  bgC() {
    this.modalClose();
  }

  /**
   * 背景を右クリック時にmodalを閉じる
   * @private @access private
   */
  bgM() {
    this.modalClose();
    return false;
  }

  /**
   * modalを閉じる
   */
  private modalClose() {
    if (!this.modal.modal) this.modal.close();
  }
}