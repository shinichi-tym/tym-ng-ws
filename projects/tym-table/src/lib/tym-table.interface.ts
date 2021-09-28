/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

/**
 * テーブルカスタマイズの定義
 */
export interface TYM_CUSTOM {
  fontFamily?: string;        // --fo-fa: Consolas, monaco, monospace
  fontSize?: string;          // --fo-sz: 1rem
  borderColor?: string;       // --bo-co: #888888
  headerBackground?: string;  // --hd-bg: #888888 linear-gradient(#888888, #666666)
  headerColor?: string;       // --hd-co: #ffffff
  headerBoxShadow?: string;   // --hd-sa: 1px 1px 3px 0 #cccccc inset
  bodyColor?: string;         // --bd-co: #000000
  bodyBoxShadow?: string;     // --bd-sa: 1px 1px 3px 0 #cccccc inset
  bodyBoxPadding?: string;    // --bd-pa: .4em
  bodyEvenColor?: string;     // --ev-co: #eeeeee
  bodyOddColor?: string;      // --od-co: #ffffff;
  bodySeldColor?: string;     // --se-co: #ffeeee;
  bodyHovrColor?: string;     // --ho-co: #eeffee;
}

/**
 * 関数の定義
 */
export interface TYM_FUNCS {
  /** data から表示行数を取得するための関数を定義, 規定値: data.length */
  getRowSize?: (data: any) => number;
  /** data から行データを取得するための関数を定義, 規定値: data[] */
  getRow?: (data: any, num: number) => any;
  /** 行データから列データを取得するための関数を定義, 規定値: row[] */
  getVal?: (row: any, num: number) => string;
  /** ソート対象ヘッダークリック時の関数を定義 */
  doOrder?: (order: string, col: number) => void;
  /** コンテキストアクションの関数を定義, 規定値: { } */
  doContext?: (event: MouseEvent, num: number, row: any) => boolean;
  /** クリックアクションの関数を定義, 規定値: { } */
  doClick?: (event: MouseEvent, num1: number, num2: number, row: any) => void;
}

/**
 * ドラッグアンドドロップの定義
 */
export interface TYM_DDDEF {
  /** ドラッグタイプ(effectAllowed), 規定値: none */
  dragType?: TYM_DRAG_TYPE;
  /** ドロップ効果(dropEffect), 規定値: none */
  dropType?: TYM_DROP_TYPE;
  /** ドラッグ開始時の関数を定義 */
  doDragStart?: (event: DragEvent, num: number, row: any) => void;
  /** ドラッグ終了時の関数を定義, 規定値: { } */
  doDragEnd?: (event: DragEvent, num: number, row: any) => void;
  /** ドロップターゲットに入った時の関数を定義 */
  doDragEnter?: (event: DragEvent, num: number, row: any) => void;
  /** ドロップターゲットの上にある時の関数を定義 */
  doDragOver?: (event: DragEvent, num: number, row: any) => void;
  /** ドロップターゲットにドロップされた時の関数を定義, 規定値: { } */
  doDrop?: (event: DragEvent, num: number, row: any) => void;
  /** @private @access private */
  _getRow?: (num: number) => any;
  /** @private @access private */
  _getComData?: () => any;
}
export type TYM_DRAG_TYPE = 
  'none' | 'copy' | 'copyLink' | 'copyMove' | 'link' | 'linkMove' |
  'move' | 'all' | 'uninitialized';
export type TYM_DROP_TYPE = 'none' | 'copy' | 'link' | 'move';

/**
 * テーブルカラムの定義
 */
export interface TYM_COL {
  /** タイトル */
  title: string;
  /** 桁幅, 例:8em, 規定値:なし */
  width?: string;
  /** 揃え, 例:right, 規定値:なし(left) */
  align?: string;
  /** ソート対象, 規定値:なし(false) */
  sortable?: boolean;
  /** クリックアクション対象, 規定値:なし(false) */
  clickable?: boolean;
}

/**
 * ソートマークの定義
 */
export interface TYM_ORDER {
  /** ソートマーク位置 */
  column: number;
  /** ソート方向, {'asc','desc',empty}, 規定値:empty */
  order: string;
}