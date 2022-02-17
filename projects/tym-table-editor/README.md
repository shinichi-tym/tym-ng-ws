
# `[tym-table-editor]`
`tym-table-editor` は，シンプルなtable編集の `angular` コンポーネントです。

<br>

表示サンプル (Display image)

![表示サンプル](/tym-table-editor-demo.png)

動作イメージ (Demo screen)

[https://shinichi-tym.github.io/tym-ng-ws-demo/index.html#tym-table-ediror]

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
<div stylle="width:300px;height:200px;overflow:auto;">
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
  :
  @ViewChild("tymTableEditor")
  private tymTableEditor?: TymTableEditorComponent;
  :
  // 
  this.tymTableEditor?getCells(...);
```

表示するためのデータを用意します。

``` typescript
let data = [
  [ 980, 627, 614460 ],
  [ 1980, 1219, 2413620 ],
  [ 2980, 116, 345680 ]
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
- [セル形式] (Cell Type) *`please wait...`*
- [表示文字編集機能] (String Formatter) *`please wait...`*
- [文字編集機能切替] (Switching String Editor) *`please wait...`*
- *`please wait...`*

<br>

- [公開関数](#公開関数) (Public Functions) *`please wait...`*

<br>

---

<br>

> ### 基本機能

<br>

- row, col, data 値を指定すると，その値に従ってテーブルを表示します。

- [定義]
``` html
<ngx-tym-table-editor #tymTableEditor
    [row]="row"
    [col]="col"
    [data]="data"
></ngx-tym-table-editor>
```

- `row: number`

- `col: number`

- `data: string[][]`

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
- `Tab`, `Shift+Tab`キーでは, 選択範囲内を移動します。 *`please wait...`*
- `Enter`, `Shift+Enter`キーでは, 選択範囲内を移動します。 *`please wait...`*
- `F2`キーで **編集モード** になります。
- `Backspace`キーで文字を消去し **編集モード** になります。
- `Delete`キーでフォーカス位置または選択範囲内の文字を消去します。
- `Shift+Delete`キーでフォーカス位置または選択範囲内の文字を切り取ります。
- `Ctrl+x`キーでフォーカス位置または選択範囲内の文字を切り取ります。
- `Ctrl+c`, `Ctrl+Insert`キーでフォーカス位置または選択範囲内の文字をコピーします。
- `Ctrl+v`, `Shift+Insert`キーでフォーカス位置に文字列を貼り付けます。  
  文字列は, 単純文字列またはタブ文字/改行文字区切りの文字群。
- `Ctrl+z`キーで変更を元に戻します。 *`please wait...`*
- `Ctrl+y`, `Ctrl+Shift+z`キーで元に戻した変更をやり直します。 *`please wait...`*
- その他のキーで **編集モード** になり, 入力した文字に置き換えます。

[編集モード]
- `Tab`, `Shift+Tab`キーで **表示モード** になります。
- `Tab`, `Shift+Tab`キーで, 入力文字を確定し, フォーカス位置を左右に移動できます。
- `Enter`, `Shift+Enter`キーで **表示モード** になります。
- `Enter`, `Shift+Enter`キーで, 入力文字を確定し, フォーカス位置を上下に移動できます。
- `Tab`, `Shift+Tab`キーでは, 選択範囲内を移動します。 *`please wait...`*
- `Enter`, `Shift+Enter`キーでは, 選択範囲内を移動します。 *`please wait...`*
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

- 行ヘッダー, 列ヘッダーをマウスでリサイズできます。
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

> ### 公開関数

<br>

> #### セルの文字列を取得する関数

<br>

    const fnc = (row: number, col: number, val: string, eol?: boolean) => {
      console.log(`row=${row},col=${col},val=${val},eol=${eol}`)
    }
    getCells(row, col, fnc);

- 指定した行数, 列数分の文字列を取得する。
- 指定した 行数 x 列数 回コールバック関数を呼び出す。

- [引数]
  - row: number
    - 取得する行数
  - col: number
    - 取得する列数
  - fnc: function
    - 取得用コールバック関数

- [戻値]
  - なし

- [コールバック関数引数]
  - row: number
    - 行位置
  - col: number
    - 列位置
  - val: string
    - セル値
  - eol: boolean
    - true  : 行中の最後のセル
    - false : 行中の最後以外のセル

- [コールバック関数戻値]
  - なし

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
