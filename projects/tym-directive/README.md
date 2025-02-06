
# `[tym-directive]`
`tym-directive` は，`angular` の極小のディレクティブ(等)です。

<br>

動作イメージ (Demo screen)

[https://shinichi-tym.github.io/tym-ng-ws-demo/index.html#tym-directive]

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-directive
```

<br>

## 目次 (Table of contents)
<br>

1. [エレメントのリサイズ処理](#エレメントのリサイズ処理)
1. [簡易テーブル表示](#簡易テーブル表示)
1. [スプリッター](#スプリッター)
1. [簡易イベント通知](#簡易イベント通知)
1. [簡易ツリー表示](#簡易ツリー表示)
1. [簡易テーブル編集](#簡易テーブル編集)
1. please wait...

<br> 

- ディレクティブを利用できるようにします。

``` typescript :app.module.ts
  :
import { TymDirectiveModule } from "tym-directive";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymDirectiveModule ],
  :
```

---

<br>

> ## エレメントのリサイズ処理

<br>

任意の `html` エレメント に対してリサイズ時の処理を行えるようにします。

- 使い方:

``` html
<div tymResize="horizontal" [tymResizeCallback]="callback">
  :
</div>
```
<pre>
tymResize="{ <u>horizontal</u> | vertical | both }"
</pre>

- 表示イメージ

![表示イメージ](/tym-resize-demo.png)

- コールバック関数を実装します。

``` typescript :app.component.ts
  :
  @Output() callback(thisElm: HTMLElement, parentElm: HTMLElement) {
    parentElm.style.width = thisElm.style.width;
    parentElm.style.height = thisElm.style.height;
  }
  :
```

<br> 

---

<br>

> ## 簡易テーブル表示

<br>

単純な二次元配列を，簡易にテーブル表示します。
カラムのリサイズが可能です。

- 使い方:

``` html
<tym-table-view
  [cols]="cols"
  [data]="data"
  [lastsp]="lastsp"
  [maxWidth]="maxWidth"
></tym-table-view>
```

- 表示するためのデータを用意します。

``` typescript
let cols: string[] = [ "単価", "販売数", "売上", "注意事項" ];
let data = [
  [ 980, 627, 614460, "" ],
  [ 1980, 1219, 2413620, "" ],
  [ 2980, 116, 345680, "※備考参照:ここには注意事項が表示されます" ],
  [ 3980, 616, 2451680, "" ]
];
let lastsp: boolean = true; // default true(スペースカラムを表示)
let maxWidth: number = 200; // default 200 px
``` 

- 必要に応じてスタイルシートを用意します。
- 注意：スタイルシートはグローバルに設定する必要があります。

``` css
tym-table-view>table {
  font-family: Consolas, monaco, monospace;
  font-size: 14px;
}
tym-table-view>table tbody tr:nth-child(even)>* {
  background-color: #eee;
}
tym-table-view>table tbody tr:nth-child(odd)>* {
  background-color: #fff;
}
tym-table-view>table thead tr th {
  width: 6em;
}
tym-table-view>table thead tr th:last-child {
  width: unset;
}
tym-table-view>table tbody tr td {
  text-align: right;
}
```

- 表示イメージ

![表示イメージ](/tym-table-view-demo.png)

<br/>

---

<br>

> ## スプリッター

<br>

コンテナ内の2つに分割された領域の分割サイズをリサイズできるようにします。

- 使い方:

``` html
<div class="wapper">
  <div style="border:solid 1px #aaa; height:100%; padding:8px; width:200px;">
    left
  </div>
  <div tym-splitter></div>
  <div style="border:solid 1px #aaa; height:100%; padding:8px;">
    <div style="height:100%; overflow: auto;">
      <tym-table-view [cols]="cols" [data]="data"></tym-table-view>
    </div>
  </div>
</div>
```

```
[tymSplitter]="['<background>','<border-color>']"
ex. <tym-table-view [tymSplitter]="['#eee', '#aaa']" ...
```

- 表示イメージ

![表示イメージ](/tym-splitter-demo.png)

<br>

---

<br>

> ## 簡易イベント通知

<br>

イベントIDとイベント関数を登録し，イベントがポストされると，同じイベントIDを持つイベント関数がすべて実行されます。

- 使い方1:

``` typescript
TymComm.add('id1', (id: string, data: any, elm: any) => console.log('ABC: ' + data));
TymComm.add('id1', (id: string, data: any, elm: any) => console.log('XYZ: ' + data));
↓
TymComm.post('id1', 'POST DATA!');
↓
>> ABC: POST DATA!
>> XYZ: POST DATA!
```

- 使い方2:

``` typescript
@Output() TymCommPost = TymComm.post;
doChange(event: any) {
  console.log('CustomEvent: ' + (event as CustomEvent).detail);
}
```

``` html
<span (click)="TymCommPost('id2', 'POST DATA!')">CLICK!</span>
<span tymCommId="id2" (change)="doChange($event)"></span>
↓(CLICK!)
>> CustomEvent: POST DATA!
```

- 使い方3:

``` typescript
@Output() TymCommPost = TymComm.post;
@Output() commListener: TYM_COMM_LISTENER = (id: string, data: any, elm: HTMLElement) => {
  elm.innerText = id + ":" + data;
}
```

``` html
<span (click)="TymCommPost('id3', 'POST DATA!')">CLICK!</span>
<span tymCommId="id3" [tymCommListener]="commListener"></span>
↓(CLICK!)
<span tymCommId="id3" [tymCommListener]="commListener">id3:POST DATA!</span>
```

- 使い方4:

``` typescript
TymComm.addListenerSet(listener: TYM_COMM_LISTENER_SET)
TymComm.add(id: string, lsn: Function)
TymComm.delElmLisrnerSet(id: string, lsn: Function)
TymComm.post(id: string, data: any)
```
<br>

---

<br>

> ## 簡易ツリー表示

<br>

単純な文字列ツリー構造データを，簡易にツリー表示します。  
選択内容の通知が可能です。コンテキストメニューが可能です。

- 使い方:

``` html
<div style="width:300px;border:solid 1px #aaa;overflow-y:auto;">
  TREE
  <tym-tree-view
    [tree]="treeview"
    [leaf]="treeviewsele"
    [menu]="treeviewmenu"
  ></tym-tree-view>
</div>
<!-- 不要であれば leaf は省略できます -->
```

- 表示するためのデータを用意します。

``` typescript
let treeview = [
  'leaf-text1',
  'leaf-text2',
  'leaf-text2',   // <= ここの子データとして
  [               // <= ここのデータが表示されます
    'leaf-text3',
    'leaf-text4',
    [
      'leaf-text5',
      'leaf-text-long-long-data',
    ],
    'leaf-text6',
  ],
  'leaf-text7',
];

const treeviewsele = (texts: string[]) => console.log(texts.join('/'));
const treeviewmenu = (texts: string[], event: MouseEvent): boolean => {
  console.log(texts.join('/'), event);
  return false;
}
``` 

- 表示イメージ

![表示イメージ](/tym-tree-view-demo.png)

<br/>

> ## 簡易テーブル編集

<br>

任意の `table` に簡易な編集機能を追加します。

- 使い方:

``` html
<table border="1" style="width:90%;table-layout:fixed;">
  <thead><tr><th>-</th><th>-</th><th>-</th><th>-</th><th>-</th></tr></thead>
  <tbody tym-table-edit>
    <tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
    <tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>
  </tbody>
</table>
<!-- tbody タグに tym-table-edit を 付与します -->
```

### キーボード操作

<br>

[表示モード]
- 上下左右のキーでフォーカス位置を移動できます。
- `Tab`, `Shift+Tab`キーでフォーカス位置を左右に移動できます。
- `Enter`, `Shift+Enter`キーでフォーカス位置を上下に移動できます。
- `Home`, `End`キーでフォーカス位置を行頭行末に移動できます。
- `Ctrl+Home`, `Ctrl+End`キーでフォーカス位置をテーブルの先頭末尾に移動できます。
- `F2`キーで **編集モード** になります。
- `Backspace`キーで文字を消去し **編集モード** になります。
- `Delete`キーでフォーカス位置の文字を消去します。
- その他のキーで **編集モード** になり, 入力した文字に置き換えます。

[編集モード]
- `Tab`, `Shift+Tab`キーで **表示モード** になります。
- `Tab`, `Shift+Tab`キーで, 入力文字を確定し, フォーカス位置を左右に移動できます。
- `Enter`, `Shift+Enter`キーで **表示モード** になります。
- `Enter`, `Shift+Enter`キーで, 入力文字を確定し, フォーカス位置を上下に移動できます。
- `Escape`キーで編集を中止し, **表示モード** になります。

<br>

- 表示イメージ

![表示イメージ](/tym-table-edit-demo.png)

<br/>

---
### `comments`
```text
* supports angular 17, 18 and 19.
```
---
### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
