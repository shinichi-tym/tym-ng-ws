/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { ViewChild, ViewContainerRef } from '@angular/core';
import { TymModalService } from './tym-modal.service';

@Component({
  selector: 'npx-tym-modals',
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
        document.addEventListener('keyup', keyup, false);
      } else {
        this.display = 'none'; // hide modal
        document.removeEventListener('keyup', keyup, false);
      }
    });
    observer.observe(divElm, { childList: true });
  }

  /**
   * ビューを初期化した後の処理
   */
  ngAfterViewInit() {
    this.modal.vcr = this.vcr;
    this.modal.cvr = this.renderer.createElement('div');
    this.modal.cvr.style.cssText = 'width:100%;height:100%;position:fixed;top:0;left:0;background:rgba(0,0,0,.1);';
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