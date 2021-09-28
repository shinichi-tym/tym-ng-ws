/*!
 * tym-directive.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[tymCommId],[tymCommListener]'
})
export class TymCommDirective {

  private _id: string = '';

  @Input() set tymCommId(id: string) {
    this._id = id;
    TymComm.listener.add(
      { id: id, elm: this.elementRef.nativeElement });
  }

  @Input() set tymCommListener(listener: TYM_COMM_LISTENER) {
    let exist = false;
    TymComm.listener.forEach((v) => {
      if (v.elm === this.elementRef.nativeElement) {
        exist = true;
        v.lsn = listener;
      }
    });
    if (!exist) {
      TymComm.listener.add(
        { id: this._id, lsn: listener, elm: this.elementRef.nativeElement });
    }
  }

  constructor(
    private elementRef: ElementRef
  ) {
  }
}

export class TymComm {

  static listener: Set<{ id: string, lsn?: Function, elm?: HTMLElement }> = new Set();

  static post(id: string, data: any) {
    TymComm.listener.forEach((v) => {
      if (id == v.id) {
        if (v.elm) {
          v.elm.dispatchEvent(new CustomEvent('change', { detail: data }));
        }
        if (v.lsn) {
          setTimeout(function (_id: string, _data: any, _elm: HTMLElement) {
            v.lsn!(_id, _data, _elm)
          }, 0, v.id, data, v.elm);
        }
      }
    })
  }

  static add(id: string, lsn: Function) {
    TymComm.listener.add({ id: id, lsn: lsn });
  }

  static addListener(listener: { id: string, lsn?: Function, elm?: HTMLElement }) {
    TymComm.listener.add(listener);
  }

}

export type TYM_COMM_LISTENER = (id: string, data: any, elm: HTMLElement) => void;
