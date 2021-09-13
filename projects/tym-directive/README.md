
# `[tym-directive]`
`tym-directive` は，`angular` の極小のディレクティブ(等)です。

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-directive
```

<br>

## 目次 (Table of contents)
<br>

1. [エレメントのリサイズ処理](#TymResize)
1. [簡易テーブル表示](#TymTableView)
1. [スプリッター](#TymSplitter)
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

<a id="TymResize"></a>

## エレメントのリサイズ処理 `(tym-resize)`
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

<a id="TymTableView"></a>

## 簡易テーブル表示 `(tym-table-view)`
<br>

単純な二次元配列を，簡易にテーブル表示します。
カラムのリサイズが可能です。

- 使い方:

``` html
<tym-table-view
  [cols]="cols"
  [data]="data"
  [lastsp]="lastsp"
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
let lastsp: boolean = true;
``` 

- 必要に応じてスタイルシートを用意します。

``` style.css
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

<a id="TymSplitter"></a>

## スプリッター `(tym-splitter)`
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
[tymSplitter]="[<background>,'<border-color>']"
ex. [tymSplitter]="['#eee', '#aaa']"
```

- 表示イメージ

![表示イメージ](/tym-splitter-demo.png)

<br>

---
### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
