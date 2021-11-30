
# `[tym-tree]`
`tym-tree` は，`angular` の簡易なツリー構造データの表示コンポーネントです。

<br>

>### please wait...

<br>

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-tree
```

<br>

- 機能を利用できるようにします。

``` typescript :app.module.ts
  :
import { TymTreeModule } from "tym-tree";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymTreeModule ],
  :
```

- 使い方:

``` html :app.component.html
  :
<ngx-tym-tree [tree]="tree"></ngx-tym-tree>
  :
※ 画面のどこかに1つ定義します。
```

表示するためのデータを用意します。

``` typescript
  @Output() tree = [
    { tx: 'data', },
    { tx: 'data', },
    {
      tx: 'DATA', children: [
        {
          tx: 'sub sub', children: [
            { tx: 'sub sub sub', },
            { tx: 'sub sub sub', },
            { tx: 'sub sub sub', },
          ]
        },
        { tx: 'sub sub', },
      ]
    },
    { tx: 'data', },
  ];
``` 
