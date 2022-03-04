
# `[tym-table-editor]`
`tym-table-editor` は，シンプルなtable編集の `angular` コンポーネントです。

<br>

表示サンプル (Display image)

![表示サンプル](/tym-table-editor-demo.png)

動作イメージ (Demo screen)

[https://shinichi-tym.github.io/tym-ng-ws-demo/index.html#tym-table-editor]

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-table-editor
```

<br>

---

<br>

> ## 基本的な使い方 `(Basic usage)`

<br>

表示される場所に htmlタグ を用意し，その中に`<ngx-tym-table-editor>`タグを作成します。

``` html
<div style="width:90%;height:400px;overflow:auto;">
    <ngx-tym-table-editor #tymTableEditor
        [data]="data"
    ><ngx-tym-table-editor>
</div>
```

コンポーネントを利用できるようにします。

``` typescript :app.module.ts
  :
import { TymTableEditorModule } from "tym-table-editor";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymTableEditorModule ],

```

コンポーネントの機能を利用する。

``` typescript :app.component.ts
  :
import { TymTableEditorComponent } from "tym-table-editor";
import { TYM_EDITOR_DEF } from "tym-table-editor";
  :
  @ViewChild("tymTableEditor")
  private tymTableEditor?: TymTableEditorComponent;
  :
  // 
  this.tymTableEditor?.getCells(...);
```

TymModalService / TymTableInputComponent を利用できるようにします。

``` typescript :app.component.ts
  :
import { TymTableInputComponent } from "tym-table-editor";
import { TymModalService } from "tym-modals";
  :
  constructor(
    private modal: TymModalService 
  :
  // TymTableInputComponent を利用し日付(<input type=date>)を入力できるようにする
  let def: TYM_EDITOR_DEF = {
    col: 1,
    editfnc: async (elm: HTMLElement, val: string, type?: string, col?: number) => {
      const provider = TymTableInputComponent.provider('date', val, elm);
      const componentRef = await this.modal.open(
        TymTableInputComponent, provider, false, () => { });
      const component = componentRef.instance as TymTableInputComponent;
      return (component.vals.isEscape) ? val : component.vals.ret;
    }
  }
```

表示するためのデータを用意します。

``` typescript
let data = [
  [ 'data 1', 'data 2', 123,     ''],
  [ '3',      '4',      12345,   'data data data data 4'],
  [ '',       '',       1234567, 'data data data data 5']
]; 
``` 

<br> 

---

<br>

> ## 機能 `(Features)`

<br>

- [基本機能](#基本機能) (Basic Function)
- [キーボード操作](#キーボード操作) (Keyboard operation)
- [セルサイズ自動変更](#セルサイズ自動変更) (Cell Size Auto Change)
- [セルサイズ変更](#セルサイズ変更) (Cell Size Change)
- [セル選択](#セル選択) (Cell Selection)
- [セル形式](#セル形式) (Cell Type)
- [表示文字編集機能](#表示文字編集機能) (String Formatter)
- [文字編集機能切替](#文字編集機能切替) (Switching String Editor)
- [コンテキストイベント](#コンテキストイベント) (Contextmenu event)
- *`please wait...`*

<br>

- [公開関数](#公開関数) (Public Functions)

<br>

---

<br>

> ### 基本機能

<br>

- `row, col, data` 値を指定すると，その値に従ってテーブルを表示します。

- [定義]
``` html
<ngx-tym-table-editor #tymTableEditor
    [row]="row"
    [col]="col"
    [defs]="defs"
    [data]="data"
    [menu]="menu"
></ngx-tym-table-editor>
```

- `row: number`
  - 表示する行数, 省略時は30行 (supports 1～99)

- `col: number`
  - 表示する列数, 省略時は20列 (supports 1～99)

- `defs: TYM_EDITOR_DEF[]`
``` typescript
/* 定義 */
export type TYM_EDITOR_DEF = {
  /** 対象列番号(1～) */
  col: number;
  /** 対象例タイプ */
  type?: string;
  /** 対象列揃え指定 {'left' | 'center' | 'right'}, , 規定値: 'left' */
  align?: 'left' | 'center' | 'right';
  /** 値を表示文字に変換する関数, 規定値: なし */
  viewfnc?: (val: string, type?: string, col?: number) => string;
  /** 値を編集する関数, 規定値: なし */
  editfnc?: (elm: HTMLElement, val: string, type?: string, col?: number) => Promise<string | null>;
}
```

- `data: string[][]`
  - 表示するデータ

- `menu: (event: MouseEvent, row1: number, col1: number, row2: number, col2: number): boolean`
  - コンテキストメニューイベント関数

<br>

---

<br>

> ### キーボード操作

<br>

[表示モード]
- 上下左右のキーでフォーカス位置を移動できます。
- `Shift`キーと上下左右キーで選択範囲を変更できます。
- `Shift`キー無し, 上下左右キーで選択範囲が解除されます。
- `Tab`, `Shift+Tab`キーでフォーカス位置を左右に移動できます。
- `Enter`, `Shift+Enter`キーでフォーカス位置を上下に移動できます。
- `Tab`, `Shift+Tab`キーでは, 選択範囲内を移動します。
- `Enter`, `Shift+Enter`キーでは, 選択範囲内を移動します。
- `F2`キーで **編集モード** になります。
- `Backspace`キーで文字を消去し **編集モード** になります。
- `Delete`キーでフォーカス位置または選択範囲内の文字を消去します。
- `Shift+Delete`キーでフォーカス位置または選択範囲内の文字を切り取ります。
- `Ctrl+x`キーでフォーカス位置または選択範囲内の文字を切り取ります。
- `Ctrl+c`, `Ctrl+Insert`キーでフォーカス位置または選択範囲内の文字をコピーします。
- `Ctrl+v`, `Shift+Insert`キーでフォーカス位置に文字列を貼り付けます。  
  文字列は, 単純文字列またはタブ文字/改行文字区切りの文字群。
- `Ctrl+z`キーで変更を元に戻します。
- `Ctrl+y`, `Ctrl+Shift+z`キーで元に戻した変更をやり直します。
- `Escape`キー 2回 でクリップボードを消去します。
- その他のキーで **編集モード** になり, 入力した文字に置き換えます。

[編集モード]
- `Tab`, `Shift+Tab`キーで **表示モード** になります。
- `Tab`, `Shift+Tab`キーで, 入力文字を確定し, フォーカス位置を左右に移動できます。
- `Enter`, `Shift+Enter`キーで **表示モード** になります。
- `Enter`, `Shift+Enter`キーで, 入力文字を確定し, フォーカス位置を上下に移動できます。
- `Tab`, `Shift+Tab`キーでは, 選択範囲内を移動します。
- `Enter`, `Shift+Enter`キーでは, 選択範囲内を移動します。
- `Escape`キーで編集を中止し, **表示モード** になります。

<br>

---

<br>

> ### セルサイズ自動変更

<br>

- 初期表示時に表示する文字の長さによって, セルの幅を広げで表示します(上限あり)。
- フォーカスのあるセルの文字が表示幅を超えている場合, セルの行数を広げて表示します。
- 選択範囲に文字が表示幅を超えているセルがある場合, 行数を広げて表示します。

<br>

---

<br>

> ### セルサイズ変更

<br>

- 行ヘッダー, 列ヘッダーをマウスでリサイズできます(not firefox)。
- 列ヘッダーをダブルクリックすると, 文字の長さによって, セルの幅を広げます(上限あり)。

<br>

---

<br>

> ### セル選択

<br>

- `Shift`キーと上下左右キーで選択範囲を変更できます。
- `Shift`キー無し, 上下左右キーで選択範囲が解除されます。
- マウスドラッグでセルが選択されます。
- 行ヘッダー, 列ヘッダーをクリックすると行/列が選択されます。
- 行ヘッダー, 列ヘッダーをドラッグすると複数の行/列が選択されます。


<br>

---

<br>

> ### セル形式

<br>

- `defs[n].type`にセル(列)の形式を指定できます。
- セル形式は, 処理に影響をあたえません。
- セル形式は, 表示文字編集機能, 文字編集機能切替 の引数となります。
- `defs[n].align`にセルの値揃えを指定できます。

<br>

---

<br>

> ### 表示文字編集機能

<br>

- `defs[n].viewfnc`に表示文字編集する関数を指定できます。
- [引数]
  - `val: string`
    - 対象セルのオリジナルの文字
  - `type: string`
    - `defs[n].type`に指定した文字
  - `col: number`
    - 対象セルの列番号

- [戻値]
  - `val: string`
    - 編集後の文字

``` typescript
// 例
let def: TYM_EDITOR_DEF = {
  col: 3,
  align: 'right',
  type: 'number',
  viewfnc: (val: string, type?: string, col?: number) => {
    console.log(type, col, val);
    return  Number.isInteger(val) ? parseInt(val).toLocaleString() : val;
  }
}
let defs = [def];
```

<br>

> ### 文字編集機能切替

<br>

- `defs[n].editfnc`に文字編集する関数を指定できます。
- [引数]
  - `elm: HTMLElement`
    - 対象セルのエレメント
  - `val: string`
    - 対象セルのオリジナルの文字
  - `type: string`
    - `defs[n].type`に指定した文字
  - `col: number`
    - 対象セルの列番号

- [戻値]
  - `val: string | null`
    - 編集後の文字, `null`の場合は反映されません  

``` typescript
// TymModalService / TymTableInputComponent を利用した例
let def: TYM_EDITOR_DEF = {
  col: 3,
  align: 'right',
  type: 'number',
  editfnc: async (elm: HTMLElement, val: string, type?: string, col?: number): Promise<string | null> => {
    const provider = TymTableInputComponent.provider(type || 'text', val, elm);
    const componentRef = await this.modal.open(TymTableInputComponent, provider, false, () => { });
    const component = componentRef.instance as TymTableInputComponent;
    return (component.vals.isEscape) ? null : component.vals.ret;
  }
}
let defs = [def];
```

<br>

> ### コンテキストイベント

<br>

- `menu` に イベント関数を設定します。右クリックすると実行されます。
- [引数]
  - `event: MouseEvent`
    - 対象セルのエレメント
  - `row1, col1: number`
    - 対象セルのオリジナルの文字
  - `row2, col2: number`
    - 対象セルのオリジナルの文字

- [戻値]
  - `true  :` イベント有効
  - `false :` イベント無効

``` typescript
// TymMenuComponent を利用した例
import { TymMenuComponent } from "tym-modals";
  :
editor_menu = (event: MouseEvent, row1: number, col1: number, row2: number, col2: number) => {
  TymMenuComponent.MENU_DEFS = {
    'row': {
      '': '行',
      'insert': '行挿入',
      'remove': '行削除'
    },
  };
  const provider = TymMenuComponent.provider(
    [[['row', false], ['insert', true], ['remove', true]]],
    (gid: string, id: string) => {
      if (id == 'insert') this.tymTableEditor?.insertRow(row1);
      if (id == 'remove') this.tymTableEditor?.removeRow(row1);
    },
    event.clientX, event.clientY
  );
  this.modal.open(TymMenuComponent, provider, false);
  event.stopPropagation();
  return true;
}
```

<br>

---

<br>

> ### 公開関数

<br>

- [セルの文字列を取得する関数](#セルの文字列を取得する関数) (getCells)
- [テーブルにデータを設定する関数](#テーブルにデータを設定する関数) (setData)
- [テーブルからデータを取得する関数](#テーブルからデータを取得する関数) (getData)
- [テーブルに行を挿入する](#テーブルに行を挿入する) (insertRow)
- [テーブルから行を削除する](#テーブルから行を削除する) (removeRow)
- [テーブルに列の挿入する] *`please wait...`*
- [テーブルに列の削除する] *`please wait...`*
- [テキストをコピーする] *`please wait...`*
- [テキストを貼り付ける] *`please wait...`*

<br>

> #### セルの文字列を取得する関数

<br>

``` typescript
let data: string[][] = [], rows: string[] = [];
const fnc = (row: number, col: number, val: string, eol?: boolean) => {
  console.log(`row=${row},col=${col},val=${val},eol=${eol}`);
  rows.push(val);
  if (eol) {
    data.push([...rows]);
    rows = [];
  }
}
this.tymTableEditor?.getCells(rownum, colnum, fnc);
console.log(data);
```

- 指定した行数, 列数分の文字列を取得する。
- 指定した 行数 x 列数 回コールバック関数を呼び出す。

- [引数]
  - `rownum: number`
    - 取得する行数
  - `colnum: number`
    - 取得する列数
  - `fnc: function`
    - 取得用コールバック関数

- [戻値]
  - なし

- [コールバック関数引数]
  - `row: number`
    - 行番号
  - `col: number`
    - 列番号
  - `val: string`
    - セル値
  - `eol: boolean`
    - `true  :` 行中の最後のセル
    - `false :` 行中の最後以外のセル

- [コールバック関数戻値]
  - なし

<br>

> #### テーブルにデータを設定する関数

<br>

``` typescript
let data: any[][] = [
  [ 'data 1', 'data 2', 123,     ''],
  [ '3',      '4',      12345,   'data data data data 4'],
  [ '',       '',       1234567, 'data data data data 5']
]; 
this.tymTableEditor?.setData(data);
this.tymTableEditor?.setData(data, row1, col1);
```

- 指定したデータをテーブルに設定する。
- `row1, col1`を指定すると, 指定位置から設定する。

- [引数]
  - `data: any[][]`
    - 設定するデータ
  - `row1: number`
    - 取得する開始行番号
  - `col1: number`
    - 取得する開始列番号

- [戻値]
  - なし

<br>

> #### テーブルからデータを取得する関数

<br>

``` typescript
let data  = this.tymTableEditor?.getData(rownum, colnum);
let range = this.tymTableEditor?.getData(row1, col1, row2, col2);
```

- `rownum, colnum`を指定すると, 先頭から指定した範囲のデータを取得する。
- `row1, col1, row2, col2`を指定すると, 指定した範囲のデータを取得する。

- [引数]
  - `rownum: number`
    - 取得する行数
  - `colnum: number`
    - 取得する列数
  - `row1: number`
    - 取得する開始行番号
  - `col1: number`
    - 取得する開始列番号
  - `row2: number`
    - 取得する終了行番号
  - `col2: number`
    - 取得する終了列番号

- [戻値]
  - `data: any[][]`
    - 取得したデータ

<br>

> #### テーブルに行を挿入する

<br>

``` typescript
insertRow(row);
```

- 指定した行番号の行の前に行を挿入する。

- [引数]
  - `row: number`
    - 挿入する行番号

- [戻値]
  なし

<br>

> #### テーブルから行を削除する

<br>

``` typescript
removeRow(row);
```

- 指定した行番号の行を削除する。

- [引数]
  - `row: number`
    - 削除する行番号

- [戻値]
  なし

<br>

> #### テーブルに列の挿入する
 *`please wait...`*

<br>

> #### テーブルに列の削除する
 *`please wait...`*

<br>

> #### テキストをコピーする
*`please wait...`*

<br>

> #### テキストを貼り付ける
*`please wait...`*

<br>

---
### `comments`
```text
* supports angular 12 and 13.
* need support for angular 11? please contact us by email
```
---
### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
