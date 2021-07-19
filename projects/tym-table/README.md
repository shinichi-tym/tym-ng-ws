
# `[tym-table]`
`tym-table` は，シンプルなtable表示のコンポーネントです。

```
作業中です (working...)
```

<br>

## インストール (Installation)
<br>

次のコマンド実行します。
```
npm install tym-table
```

<br>

## 基本的な使い方 (Basic usage)
<br>

表示される場所に htmlタグ を用意し，その中に`<tym-table>`タグを作成します：

```html
<div stylle="width:300px;height:200px;">
    <tym-table
        [coldef]="coldef"
        [data]="data"
    >
</div>
```

表示するためのデータを用意します。

``` javascript
var coldef = [
    { title: "単価" },
    { title: "販売数" },
    { title: "売上" }
]; 
var data = [
    [ 980, 627, 614460],
    [ 1980, 1219, 2413620],
    [ 2980, 116, 345680]
]; 

``` 

<br/> 

### 機能 (Features)

- カラムサイズ変更 (Column size change)
- 行選択 (Row selection)

<br/>

### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](./github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
