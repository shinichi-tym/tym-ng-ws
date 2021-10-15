/*!
 * tym-directive.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';

@Directive({
  selector: '[tymCommId],[tymCommListener]'
})
export class TymCommDirective implements OnInit {

  @Input() tymCommId: string = '';

  @Input() tymCommListener: TYM_COMM_LISTENER | undefined = undefined;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    TymComm.addListenerSet(
      { id: this.tymCommId, lsn: this.tymCommListener, elm: this.elementRef.nativeElement });
  }
}

@Injectable({
  providedIn: 'root',
})
export class TymComm {

  private static _listener_set: Set<TYM_COMM_LISTENER_SET> = new Set();

  public static post(id: string, data: any) {
    TymComm._listener_set.forEach((v) => {
      if (id == v.id) {
        if (v.elm) {
          if (v.elm?.isConnected) {
            try {
              v.elm.dispatchEvent(new CustomEvent('change', { detail: data }));
            } catch (error) {
              v.elm = v.lsn = undefined;
            }
          } else {
            v.elm = v.lsn = undefined;
          }
        }
        if (v.lsn) {
          setTimeout(function (_id: string, _data: any, _elm: HTMLElement) {
            try {
              v.lsn!(_id, _data, _elm)
            } catch (error) {
              v.lsn = undefined;
            }
          }, 0, v.id, data, v.elm);
        }
      } else {
        if (!v.elm?.isConnected) {
          v.elm = v.lsn = undefined;
        }
      }
      if (!v.elm && !v.lsn) {
        TymComm._listener_set.delete(v);
      }
    })
  }
  public post = TymComm.post;

  public static add(id: string, lsn: Function) {
    TymComm._listener_set.add({ id: id, lsn: lsn });
  }
  public add = TymComm.add;

  public static addListenerSet(listener: TYM_COMM_LISTENER_SET) {
    TymComm._listener_set.add(listener);
  }

  public static delElmLisrnerSet(id: string, lsn: Function) {
    TymComm._listener_set.forEach((v) => {
      if (v.id == id && v.lsn == lsn) {
        TymComm._listener_set.delete(v);
      }
    });
  }
  public delElmLisrnerSet = TymComm.delElmLisrnerSet;

}

export type TYM_COMM_LISTENER = (id: string, data: any, elm: HTMLElement) => void;
export type TYM_COMM_LISTENER_SET = { id: string, lsn?: Function, elm?: HTMLElement }