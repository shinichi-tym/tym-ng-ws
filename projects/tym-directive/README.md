
# `[tym-directive]`
`tym-directive` は，`angular` の極小のディレクティブです。

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-directive
```

<br>

## 目次 (Table of contents)
<br>

1. [tym-resize](./projects/tym-table/README.md)
1. please wait...

---

<br>

## エレメントのリサイズ処理 `(tym-resize)`
<br>

任意の`html`エレメントに対してリサイズ時の処理を行えるようにします。

- 使い方:

``` html
<div tym-resize [tymResizeCallback]="callback">
  :
</div>
```

ディレクティブを利用できるようにします。

``` typescript :app.module.ts
  :
import { TymDirectiveModule } from "tym-directive";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymDirectiveModule ],

```

コールバック関数を実装します。

``` typescript :app.component.ts
  :
  @Output() callback(thisElm: HTMLElement, parentElm: HTMLElement) {
    parentElm.style.width = thisElm.style.width;
    parentElm.style.height = thisElm.style.height;
  }

```

<br/> 

---

<br/>

### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
