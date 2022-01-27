/*!
 * tym-directive.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Component, ViewEncapsulation, ElementRef, Input, Output } from '@angular/core';

  /********************************************************************
  tree = [
    'leaf-text',
    'leaf-text',
    [
      'leaf-text',
      'leaf-text',
    ],
    'leaf-text',
  ]
  *********************************************************************/

type TREE = TREE[] | string;

type LEAF = {
  /** リーフに表示する文字 */
  tx: string;
  /** 子リーフの配列 */
  ix: string[];
}

const gettexts = (leafs: LEAF[], index: number): string[] => {
  let ret: string[] = [];
  let lvl = leafs[index].ix.length;
  ret.push(leafs[index].tx);
  for (let i = index - 1; i >= 0; i--) {
    if (leafs[i].ix.length < lvl) {
      lvl = leafs[i].ix.length;
      ret.push(leafs[i].tx);
    }
  }
  return ret.reverse();
}

@Component({
  selector: 'tym-tree-view',
  templateUrl: './tym-tree-view.component.html',
  styleUrls: ['./tym-tree-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TymTreeViewComponent {

  @Output() leafs: LEAF[] = [];
  @Output() leafclick: (index: number) => void = this._leafclick;
  @Output() leafmenu: (index: number, event: MouseEvent) => boolean = this._leafcontext;

  @Input() set tree(tree: TREE[]) {
    const leafs = this.leafs;
    // make leaf
    const mkleaf = (_tree: TREE, _level: number) => {
      const [_text, _array] = (typeof _tree === 'string') ? [_tree,] : [, _tree];
      if (_text) leafs.push({ tx: _text, ix: Array(_level + 1).fill('b0') });
      if (_array) _array.forEach(_t => mkleaf(_t, _level + 1));
    }
    mkleaf(tree, -1);
    // make indent ( b0: , b1:│, b2:├, b3:└ )
    for (let _i = 1; _i < leafs.length; _i++) {
      const _l = leafs[_i];
      const [cur_l_max, bfo_l_max] = [_l.ix.length - 1, leafs[_i - 1].ix.length - 1];
      // set indent mark: before
      const bfo_l_1 = (bfo_l_max == cur_l_max) ? 'b2'
        : (bfo_l_max + 1 == cur_l_max || bfo_l_max > cur_l_max) ? 'b3' : undefined;
      if (bfo_l_1) leafs[_i - 1].ix[bfo_l_max] = bfo_l_1;
      // set indent mark: vertical line
      if (bfo_l_max > cur_l_max && cur_l_max >= 0) {
        for (let j = cur_l_max; j >= 0; j--) {
          for (let i = _i - 1; i >= 0; i--) {
            const _ix = leafs[i].ix;
            if (_ix[j] == 'b0') { _ix[j] = 'b1'; }
            if (_ix[j] == 'b3') { _ix[j] = 'b2'; break; }
          }
        }
      }
    }
    // set indent mark: last leaf
    const lastleaf = leafs[leafs.length - 1];
    lastleaf.ix[lastleaf.ix.length - 1] = 'b3';
  }

  @Input() set leaf(callback: (texts: string[]) => void) {
    const leafs = this.leafs;
    this.leafclick = (index: number) => {
      this._leafclick(index);
      callback(gettexts(this.leafs, index));
    }
  }
  private _leafclick(index: number) {
    const thisElm = this.elementRef.nativeElement as HTMLElement;
    thisElm.querySelector('.cur')?.classList.remove('cur');
    (thisElm.childNodes[index] as HTMLElement).classList.add('cur');
  }

  @Input() set menu(callback: (texts: string[], event: MouseEvent) => boolean) {
    this.leafmenu = (index: number, event: MouseEvent): boolean => {
      this._leafcontext(index, event);
      return callback(gettexts(this.leafs, index), event);
    }
  }
  private _leafcontext(index: number, event: MouseEvent): boolean {
    this._leafclick(index);
    return true;
  }

  /**
   * コンストラクタ
   *
   * @memberof TymTreeViewComponent
   */
  constructor(private elementRef: ElementRef) { };
}