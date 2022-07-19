
# `[tym-form]`
`tym-form` は，シンプルなform表示の `angular` コンポーネントです。

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

表示される場所に`<ngx-tym-form>`タグを作成します。

``` html
<ngx-tym-form #tymForm
    [vals]="vals"
    formTextUrl="./assets/panel1.txt"
></ngx-tym-form>
```

表示する画面データを文字列 または テキストファイルとして用意します。

``` text :panel.txt
パネル１
───────────────────────
 登録日   [a                ]
 商品ID   [b       ]
 商品区分 [c         ] / 商品コード [d       ]
[DEF]
{id}:{var name}:{type}:{inputmode}:{pattern}:{required}:{placeholder}:{title}:{line}:{option}
a:tourokubi    :date  :           :         :          :             :       :      :
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
  this.tymform!.formTextUrl = './assets/panel2.txt';
```

<br> 

---

<br>

> ## 機能 `(Features)`

<br>

- [基本機能](#基本機能) (Basic Function)
- [ファイル仕様](#ファイル仕様) (File Specifications)
- [ダイアログ表示機能](#ダイアログ表示機能) (Dialog View Function)
- [カスタマイズ](#カスタマイズ) (Customization)
- [応用](#応用) (How To)

<br>

---

<br>

> ### 基本機能

<br>

- formText に指定したテキスト または formTextUrl に指定したファイルの内容に従って画面を表示します。

- [定義]
``` html
<ngx-tym-form #tymForm
    [vals]="vals"
    [formText]="text"
    [formTextUrl]="texturl"
    [button]="button"
    [enter]="enter"
    [opts]="opts"
></ngx-tym-form>
```
- `vals: any`
  - form に表示する変数, form に入力された変数。
  - `type.checkbox`, `type.radio` では, 文字列配列になります。
``` typescript
let vals = {
  tourokubi: '2022-02-22',
  id: '',
  cat: '',
  code: '',
}
```
- `formText: string`
``` text:panel.txt
パネル１
───────────────────────
 登録日   [a                ]
 商品ID   [b       ]
 商品区分 [c         ] / 商品コード [d       ]
[DEF]
a:tourokubi    :date  :::::::
b:id           :text  :::::::
c:cat          :text  :::::::
d:code         :text  :::::::
```

- `formTextUrl: string`
``` typescript
this.tymform!.formTextUrl = './assets/panel2.txt';
```

- `button: (event: MouseEvent, vals: any, varname: string) => void`
``` typescript
const button = (event: MouseEvent, vals: any, varname: string) => {
  if (varname == 'b1') {
    console.log('b1 ボタンが押されました');
  }
}
```

- `enter: (event: KeyboardEvent, vals: any, varname: string) => void`
``` typescript
const enter = (event: KeyboardEvent, vals: any, varname: string) => {
  if (varname == 'cmdtext') {
    console.log(`${vals.cmdtext} を実行します`);
  }
}
```

- `opts: TYM_FORM_OPTS`
``` typescript
/**
 * フォームスタイルカスタマイズの定義
 */
export type TYM_FORM_OPTS = {
  /** font size, default:16px */
  /** line height, default:24px */

  /** zoom, default:1 */
  zoom?: string,

  /** font color, default:#000 */
  fontColor?: string,
  /** font family, default:monospace, monospace */
  fontFamily?: string,
  /** tab size, default:unset */
  tabSize?: string,
  /** set '16px' to line height */
  lineHeight16px?: boolean,
  /** border style, default:double */
  borderStyle?: string,
  /** border color, default:#888 */
  borderColor?: string,
  /** background color, default:#eff */
  backgroundColor?: string,

  /** form element border, default:dotted 1px #ccc */
  formBorder?: string,
  /** form element font color, default:#000 */
  formFontColor?: string,
  /** form element background color, default:#efe */
  formBackgroundColor?: string,
  /** form element focus outline, default:solid 1px #888 */
  formFocusOutline?: string,
  /** form element invalid border, default:solid 1px #f00 */
  formInvalidBorder?: string,

  /** border bottom positions(0,1～max line), default:none */
  borderLines?: number[],
}
```

<br>

---

<br>

> ### ファイル仕様

<br>

![ファイル仕様説明](/tym-form-info.png)

- 画面を定義します。
- 定義は `[DEF]` の前後で `画面部` と `定義部` があります。
- `定義部` は, 新しい `定義部` を入力するまで引き継がれます。
- `画面部`
  - 画面のフォーマットを定義します。
  - 画面は固定長フォントでそのまま表示します。
  - 入力フォームは `'['`+`'英小文字'` ～ `']'` で定義します。
  - `'英小文字'` は `定義部` の `{id}` と対応させます。
- `定義部`
  - 入力フォームの情報を定義します。
  - 情報は `':'` 区切りで複数あります。
  - カラム1 : `{id}` (必須)
    - `画面部` と `定義部` の入力フォームを関連付けに利用します。
  - カラム2 : `{var name}` (必須)
    - `vals` の メンバー変数(例:`vals.tourokubi`) を定義します。
  - カラム3 : `{type}` (省略値:text)
    - `input` タグの `type` 属性の値を定義します。
    - `type` の値によって生成されるタグが異なります。  
      `checkbox`, `radio` は `span` と複数の `input` タグ  
      `file` は `label`, `input` タグ  
      `select` は `select`, `option` タグ  
      `datalist` は `input`, `datalist`, `option` タグ
  - カラム4 : `{inputmode}` (省略値:なし)
    - `input` タグの `inputmode` 属性の値を定義します。
  - カラム5 : `{pattern}` (省略値:なし)
    - `input` タグの `pattern` 属性の値を定義します。
  - カラム6 : `{required}` {'y' | その他} (省略値:なし)
    - `input` タグの `required` 属性の値を定義します。  
    `'y'` を指定すると設定します。
  - カラム7 : `{placeholder}` (省略値:なし)
    - `input` タグの `placeholder` 属性の値を定義します。
  - カラム8 : `{title}` (省略値:なし)
    - `input` タグの `title` 属性の値を定義します。
  - カラム9 : `{line}` (省略値:1)
    - 入力フォームの行数を定義します。
  - カラム10 : `{option}` (省略値:なし)
    - カンマ区切りで情報を定義します。
    - `type:checkbox` では, `ラベル`
    - `type:radio` では, `ラベル`
    - `type:file` では, `未選択時のメッセージ`
    - `type:select` では, 複数の `項目`
    - `type:reset`, `type:button` では,  
      `ボタン名`, `color`, `bgColor`
    - `type:submit` では,   
      `ボタン名`, `color`, `bgColor`, `method`, `action`, `target`  
      ※ `method`, `action`, `target` は`<form>` タグに設定します。
    - `type:datalist` では, 複数の `項目`
  - `type` の値に `file` をすると, `<form>` タグに `enctype="multipart/form-data"` を設定します。

<br>

---

<br>

> ### ダイアログ表示機能

<br>

- `tym-modals` を利用してダイアログ形式で表示できます。
``` typescript
  :
import { TymFormComponent } from "tym-form";
import { TymModalService } from "tym-modals";
  :
  constructor(private modal: TymModalService) { }
  :
```
``` typescript
let vals = {
  tourokubi: '2022-02-22',
  id: '',
  cat: '',
  code: '',
}
const button = (event: MouseEvent, vals: any, varname: string) => {
  if (varname == 'b1') {
    console.log('b1 ボタンが押されました');
  }
  if (varname == 'close') {
     compoRef.destory();
  }
}
const provider = TymFormComponent.provider(
  vals, '', './assets/panel1.txt', opts, button
);
let compoRef = this.modal.open(TymFormComponent, provider);
```

<br>

---

<br>

> ### カスタマイズ

<br>

- `opts` 値を設定するとカスタマイズできます。

``` typescript
opts = {
  zoom:'70%',
  lineHeight16px:true,
  borderColor:'transparent',
  backgroundColor:'#fff',
}; 
```

- プロポーショナルフォントを利用する場合, `tabSize` を利用すると画面部を定義しやすくなります。

``` text:panel.txt
--- panel.txt ---
123456789+123456789+123456789+123456789+
プロポーショナルフォント\t[a\t]
proportional font\t[b\t]
[DEF]
a:font1:text:::::::
b:font2:text:::::::
--- end of file ---
```

``` html
<ngx-tym-form #tymForm
    [formTextUrl]="./panel.txt"
    [opts]="{fontFamily: 'system-ui', tabSize: '25'}"
></ngx-tym-form>
```

![表示サンプル](/tym-form-smpl.png)

<br>

> ### 応用

<br>

- 定義部を複数の画面部と共有する場合, 画面部 と 定義部 を別で用意し利用できます。

``` text: def.txt
--- def.txt ---
[DEF]
a:tourokubi    :date  :::::::
b:id           :text  :::::::
c:cat          :text  :::::::
d:code         :text  :::::::
--- end of file ---
```
``` text: panel1.txt
--- panel1.txt ---
パネル１
───────────────────────
 登録日   [a                ]
 商品ID   [b       ]
 --- end of file ---
```
``` text: panel2.txt
--- panel2.txt ---
パネル２
───────────────────────
 商品ID   [b       ]
 商品区分 [c         ] / 商品コード [d       ]
 --- end of file ---
```
``` html
<ngx-tym-form #tymForm
    [vals]="vals"
    formTextUrl="./assets/def.txt"
></ngx-tym-form>
```
``` typescript :app.component.ts
  :
import { TymFormComponent } from "tym-form";
  :
  @ViewChild("tymForm")  
  private tymForm?: TymFormComponent;
  :
  // パネルの切り替え実行
  this.tymform!.formTextUrl = './assets/panel1.txt';
  :
  // パネルの切り替え実行
  this.tymform!.formTextUrl = './assets/panel2.txt';
```

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
