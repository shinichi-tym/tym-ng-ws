
# `[tym-form]`
`tym-form` は，シンプルなform表示の `angular` コンポーネントです。

    now writing ...

<br>

表示サンプル (Display image)

![表示サンプル](/tym-form-demo.png)

動作イメージ (Demo screen)

[https://shinichi-tym.github.io/tym-ng-ws-demo/index.html#tym-form]

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-form
```

<br>

---

<br>

> ## 基本的な使い方 `(Basic usage)`

<br>

表示される場所に htmlタグ を用意し，その中に`<ngx-tym-form>`タグを作成します。
また, 表示する画面データをテキストファイルとして用意します。

``` html
<ngx-tym-form #tynForm
    [vals]="vals"
    formTextUrl="/assets/panel.txt"
></ngx-tym-form>
```

``` text:panel.txt
パネル１
───────────────────────
 登録日   [a                ]
 商品ID   [b       ]
 商品区分 [c         ] / 商品コード [d       ]
[DEF]
{id}:{var name}:{type}:{inputmode}:{pattern}:{required}:{placeholder}:{title}:{line}:{option}
a:date         :date  :           :         :          :             :       :      :
b:id           :text  :           :         :          :             :       :      :
c:cat          :text  :           :         :          :             :       :      :
d:code         :text  :           :         :          :             :       :      :
```

コンポーネントを利用できるようにします。

``` typescript :app.module.ts
  :
import { TymFormModule } from "tym-form";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymFormModule ],

```

コンポーネントの機能を利用する。

``` typescript :app.component.ts
  :
import { TymFormComponent } from "tym-form";
  :
  @ViewChild("tymForm")
  private tymForm?: TymFormComponent;
  :
  // パネルの切り替え実行
  this.tymform!.formTextUrl = '/assets/panel2.txt';
```

<br> 

---

<br>

> ## 機能 `(Features)`

<br>

- [基本機能](#基本機能) (Basic Function)

<br>

---

<br>

> ### 基本機能

<br>

- custom, afnc, cols, data, odrmk 値を指定すると，その値に従ってテーブルを表示します。

- [定義]
``` html
<ngx-tym-form #tymForm
    [vals]="vals"
    [formText]="text"
    [formTextUrl]="texturl"
    [button]="buttonfunc"
    [enter]="enterfunc"
  @Input() button = (varname: string, event: MouseEvent) => { }

  @Input() enter = (varname: string, event: KeyboardEvent) => { }

></ngx-tym-table>
```
- `vals: any`
``` typescript

  ...

```
- `formText: string`
``` typescript

  ...

```
- `formTextUrl: string`
``` typescript

  ..

```

- `button: (varname: string, event: MouseEvent) => void`

- `enter: (varname: string, event: KeyboardEvent) => void`

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
