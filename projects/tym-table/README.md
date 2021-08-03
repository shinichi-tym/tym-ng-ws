
# `[tym-table]`
`tym-table` は，シンプルなtable表示のコンポーネントです。

```
作業中です (working...)
```

<br>

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-table
```

<br>

---

<br>

## 基本的な使い方 `(Basic usage)`
<br>

表示される場所に htmlタグ を用意し，その中に`<ngx-tym-table>`タグを作成します：

``` html
<div stylle="width:300px;height:200px;overflow:auto;">
    <ngx-tym-table
        [cols]="cols"
        [data]="data"
    ><ngx-tym-table>
</div>
```

表示するためのデータを用意します。

``` typescript
let cols: COL[] = [
    { title: "単価" },
    { title: "販売数" },
    { title: "売上" }
]

let data = [
    [ 980, 627, 614460 ],
    [ 1980, 1219, 2413620 ],
    [ 2980, 116, 345680 ]
]; 
``` 

<br/> 

---

<br/>

## 機能 `(Features)`

- [基本機能](#Basicfunction)
- [カラーカスタマイズ](#ColorCustomization)
- カラムサイズ変更 (Column size change)
- 行選択 (Row selection)
- ソートイベント (Sort event) (coming soon..)
- ドラッグアンドドロップ (Drag and drop) (coming soon..)

<br/>

---

<br/>

<a id="Basicfunction"></a>

### 基本機能

- custom, afnc, cols, data, odrmk 値を変更すると，その値に従ってテーブルを表示します。

- [定義]
``` html
<ngx-tym-table
    [custom]="custom"
    [afnc]="afnc"
    [cols]="cols"
    [data]="data"
    [odrmk]="odrmk"
><ngx-tym-table>
```
- [CUSTOM]
``` typescript
export interface CUSTOM {
                              // innerid: default
  fontFamily?: string;        // --fo-fa: Consolas, monaco, monospace
  fontSize?: string           // --fo-sz: 1rem
  borderColor?: string;       // --bo-co: #888888
  headerBackground?: string;  // --hd-bg: #888888 linear-gradient(#888888, #666666)
  headerColor?: string;       // --hd-co: #ffffff
  headerBoxShadow?: string;   // --hd-sa: 1px 1px 3px 0 #cccccc inset
  bodyColor?: string;         // --bd-co: #000000
  bodyBoxShadow?: string;     // --bd-sa: 1px 1px 3px 0 #cccccc inset
  bodyEvenColor?: string;     // --ev-co: #eeeeee
  bodyOddColor?: string;      // --od-co: ffffff;
  bodySeldColor?: string;     // --se-co: #ffeeee;
  bodyHovrColor?: string;     // --ho-co: #eeffee;
}
```
- [ACCESS_FUNCTIONS]
``` typescript
/* テーブルの定義 */
export interface ACCESS_FUNCTIONS {
  /** data から表示行数を取得するための関数を定義, 規定値: data.length */
  getRowSize?: (data: any) => number;
  /** data から行データを取得するための関数を定義, 規定値: data[] */
  getRow?: (data: any, num: number) => any;
  /** 行データから列データを取得するための関数を定義, 規定値: row[] */
  getVal?: (row: any, num: number) => string;
  /** ソート対象ヘッダークリック時の関数を定義 */
  doOrder?: (order: string, col: number) => void;
}
```
- [COL]
``` typescript
/* テーブルカラムの定義 */
export interface COL {
  title: string;
  width?: string;
  align?: string;
  sortable?: boolean;
}
```
- [ORDER_MARK]
``` typescript
/* テーブルカラムの定義 */
export interface ORDER_MARK {
  column: number;
  order: string;
}
```

<br/>

---

<br/>

<a id="ColorCustomization"></a>

### カラーカスタマイズ (Color customization)

- custom 値を設定するとカラーをカスタマイズできます。

``` typescript
custom = {
    bodySeldColor: "#ffeeee",
    bodyHovrColor: "#eeffee"
}; 
```

<br/>

---

<br/>

<a id="ColumnSizeChange"></a>

### カラムサイズ変更 (ColumnSizeChange)

- ヘッダー部分にリサイズマークを左右に移動させるとカラムサイズが変わります。
- カラムサイズは，`COL[]` を設定するとリセットされます。

<br/>

---

<br/>

<a id="RowSelection"></a>

### 行選択 (RowSelection)

- 行頭のチェックボックスによって選択行になります。
- 選択された行は，`custom.bodySeldColor` の色に変化します。
- 選択された行は `Drag and drop (coming soon..)` の対象になります。

<br/>

---

<br/>

<a id="SortEvent"></a>

### ソートイベント (SortEvent) `(coming soon..)`

<a id="DragAndDrop"></a>

<br/>

---

<br/>

### ドラッグアンドドロップ (DragAndDrop) `(coming soon..)`

<br/>

---

<br/>

### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
