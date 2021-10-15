/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { TymModalService } from './tym-modal.service';

@Component({
  selector: 'npx-tym-modals',
  template: `<div class="bg" (click)="bgClick()" [style.display]="display"><div #inn></div></div>`,
  styleUrls: ['./tym-modal.component.scss']
})
export class TymModalComponent implements OnInit, AfterViewInit {

  /**
   * モーダルサービスで利用するViewContainerRef
   */
  @ViewChild('inn', { read: ViewContainerRef }) vcr: any;

  /**
   * 全画面ラッパー表示・非表示用
   */
  public display = 'none';

  /**
   * コンストラクター
   * 
   * @param {ElementRef} elementRef このコンポーネントがセットされたDOMへの参照
   * @param {TymModalService} modal モーダルサービス
   * @memberof TymModalComponent
   */
  constructor(
    private elementRef: ElementRef,
    private modal: TymModalService
  ) { }

  ngOnInit(): void {
    const thisElm: HTMLElement = this.elementRef.nativeElement;
    const divElm = thisElm.firstElementChild as HTMLDivElement;
    const observer = new MutationObserver(() => {
      this.display = (divElm.childElementCount > 1) ? '' : 'none';
    });
    observer.observe(divElm, { childList: true });
  }

  ngAfterViewInit() {
    this.modal.vcr = this.vcr;
  }
  bgClick() {
    if (!this.modal.modal) {
      this.modal.close();
    }
  }
  close() {
    this.modal.close();
  }

}