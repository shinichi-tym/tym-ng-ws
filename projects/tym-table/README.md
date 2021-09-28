
# `[tym-table]`
`tym-table` は，シンプルなtable表示の `angular` コンポーネントです。

<br>

表示サンプル (Display image)

![表示サンプル](/tym-table-demo.png)


![表示サンプル](/tym-table-demo2.png)

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

表示される場所に htmlタグ を用意し，その中に`<ngx-tym-table>`タグを作成します。

``` html
<div stylle="width:300px;height:200px;overflow:auto;">
    <ngx-tym-table #tymTable
        [cols]="cols"
        [data]="data"
    ><ngx-tym-table>
</div>
```

コンポーネントを利用できるようにします。

``` typescript :app.module.ts
  :
import { TymTableModule } from "tym-table";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymTableModule ],

```

コンポーネントの機能を利用する。

``` typescript :app.component.ts
  :
import { TymTableModule } from "tym-table";
  :
  @ViewChild("tymTable")
  private tymTable?: TymTableComponent;
  :
  // 直接再描画を実行
  this.tymTable?.drowData();
```

表示するためのデータを用意します。

``` typescript
let cols: string[] = [ "単価", "販売数", "売上" ]
or
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

- [基本機能](#Basicfunction) (Basic function)
- [カラーカスタマイズ](#ColorCustomization) (Color Customization)
- [チェックボックス非表示](#NoCheckBox) (No CheckBox)
- [スペースカラム非表示](#NoLastSpace) (No Last Space)
- [カラムサイズ変更](#ColumnSizeChange) (ColumnSize Change)
- [行選択](#RowSelection) (Row Selection)
- [ソートイベント](#SortEvent) (Sort Event)
- [ドラッグアンドドロップ](#DragAndDrop) (Drag And Drop)

- [公開関数](#PublicFunctions) (Public Functions)

<br/>

---

<br/>

<a id="Basicfunction"></a>

### 基本機能 `(Basic function)`

- custom, afnc, cols, data, odrmk 値を指定すると，その値に従ってテーブルを表示します。

- [定義]
``` html
<ngx-tym-table #tymTable
    [custom]="custom"
    [afnc]="afnc"
    [cols]="cols"
    [data]="data"
    [odrmk]="odrmk"
    [dddef]="dddef"
    [chkbox]="chkbox"
    [latstp]="latstp"
><ngx-tym-table>
```
- `custom: TYM_CUSTOM`
``` typescript
/* テーブルカスタマイズの定義 */
export interface TYM_CUSTOM {
                              // innerid: default
  fontFamily?: string;        // --fo-fa: Consolas, monaco, monospace
  fontSize?: string           // --fo-sz: 1rem
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
```
- `afnc: TYM_FUNCS`
``` typescript
/* 関数の定義 */
export interface TYM_FUNCS {
  /** data から表示行数を取得するための関数を定義, 規定値: data.length */
  getRowSize?: (data: any) => number;
  /** data から行データを取得するための関数を定義, 規定値: data[num] */
  getRow?: (data: any, num: number) => any;
  /** 行データから列データを取得するための関数を定義, 規定値: row[num] */
  getVal?: (row: any, num: number) => string;
  /** ソート対象ヘッダークリック時の関数を定義 */
  doOrder?: (order: string, col: number) => void;
  /** コンテキストアクションの関数を定義, 規定値: { } */
  doContext?: (event: MouseEvent, num: number, row: any) => boolean;
  /** クリックアクションの関数を定義, 規定値: { } */
  doClick?: (event: MouseEvent, num: number, row: any) => void;
}
/* 規定値 */
doOrder(order: string, num: number) {
  this.odrmk = {
    column: num,
    order: (order == 'asc') ? 'desc' : 'asc' } as TYM_ORDER;
}
```
- `cols: TYM_COL[]`
``` typescript
/* テーブルカラムの定義 */
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
```

- `data: string[][] | any`

- `odrmk: TYM_ORDER`
``` typescript
/* テーブルカラムの定義 */
export interface TYM_ORDER {
  /** ソートマーク位置 */
  column: number;
  /** ソート方向, {'asc','desc',empty}, 規定値:empty */
  order: string;
}
```
- `dddef: TYM_DDDEF`
``` typescript
/* ドラッグアンドドロップの定義 */
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
/* 規定値 */
doDragStart(event: DragEvent, num: number, row: any) {
  event.dataTransfer?.setData('text/plain', num.toString());
  event.dataTransfer?.setData('application/json', JSON.stringify(row));
  event.dataTransfer!.dropEffect = (this.dddef.dragType ?? 'none') as any;
}
dragEnterOrOver(event: DragEvent, num: number, row: any) {
  event.preventDefault();
  if (this._dd_def.dropType != event.dataTransfer?.effectAllowed) {
    if (event.dataTransfer?.effectAllowed == 'copyMove') {
      event.dataTransfer!.dropEffect = this._dd_def.dropType as any;
    } else {
      event.dataTransfer!.dropEffect = 'none';
    }
  } else {
    event.dataTransfer!.dropEffect = this._dd_def.dropType as any;
  }
}
doDragEnter = dragEnterOrOver;
doDragOver = dragEnterOrOver;
```

- `chkbox: boolean`

- `lastsp: boolean`

<br/>

---

<br/>

<a id="ColorCustomization"></a>

### カラーカスタマイズ `(Color customization)`

- `custom` 値を設定するとカラーをカスタマイズできます。

``` typescript
custom = {
  bodySeldColor: "#ffeeee",
  bodyHovrColor: "#eeffee"
}; 
```

<br/>

---

<br/>

<a id="NoCheckBox"></a>

### チェックボックス非表示 `(No CheckBox)`

- `chkbox` に `false` を設定するとチェックボックスカラムを非表示にできます。

``` typescript
chkbox = false;
```

<br/>

---

<br/>

<a id="NoLastSpace"></a>

### スペースカラム非表示 `(No Last Space)`

- `lastsp` に `false` を設定するとスペースカラムを非表示にできます。

``` typescript
lastsp = false;
```

<br/>

---

<br/>

<a id="ColumnSizeChange"></a>

### カラムサイズ変更 (ColumnSizeChange)

- ヘッダー部分にリサイズマークを左右に移動させるとカラムサイズが変わります。
- カラムサイズは，`cols` を設定するとリセットされます。

<br/>

---

<br/>

<a id="RowSelection"></a>

### 行選択 `(Row Selection)`

- 行頭のチェックボックスによって選択行になります。
- 選択された行は，`custom.bodySeldColor` の色に変化します。
- 選択された行は，ドラッグアンドドロップの対象になります。
- `chkbox` が `false` の場合は行選択できません。  
ただし，`setSelection` 関数では行選択できます。

<br/>

---

<br/>

<a id="SortEvent"></a>

### ソートイベント `(Sort Event)`

- `COL` の `sortable` を設定したカラムにはオーダーマークが表示されます。
- オーダーマークが表示されたヘッダー行の文字をクリックすると `doOrder` がコールバックされます。
- `doOrder` 内で必要な処理を行い `odrmk` を設定してください。

<br/>

---

<br/>

<a id="DragAndDrop"></a>

### ドラッグアンドドロップ `(Drag And Drop)`

- `dddef` を適切に設定し行選択すると，行をドロップできます。
- `dddef` に設定した各関数を利用して必要な処理を実装してください。
- `dddef` の `dragType,dragType` は，`'none','copy','move','copyMove'` だけをサポートします。

<br/>

---

<br/>

<a id="PublicFunctions"></a>

### 公開関数 `(Public Functions)`

<br/>

#### drowData : 再描画する関数

- htmlタグで指定した `cols`, `data`, `odrmk` の値だけを変更した場合，変更が検出されない。  
  この関数を呼び出すと再描画が行われます。

- [引数]
  - なし

- [戻値]
  - なし

<br/>

#### getSelection : 選択行を返却する関数

- 選択された状態になっている行番号(複数)を返却する。

- [引数]
  - なし

- [戻値]
  - rownums: number[]

<br/>

#### clearSelection : 選択行をすべてクリアする

- 選択された状態になっている全ての行の選択状態を解除する。

- [引数]
  - なし

- [戻値]
  - なし

### setSelection : 指定した行番号(複数)を選択状態にする

- [引数]
  - rownums: number[]

- [戻値]
  - なし

---

<br/>

### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
