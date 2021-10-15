
# `[tym-modals]`
`tym-modals` は，`angular` の簡易なダイアログやコンテキストメニュー表示用のラッパーです。

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-modals
```

<br>

## 目次 (Table of contents)
<br>

1. [簡易メッセージダイアログ](#TymDialog)
1. 簡易コンテキストメニュー (未実装)
1. ネストダイアログ／コンテキストメニュー (未実装)
1. please wait...

<br> 

- 機能を利用できるようにします。

``` typescript :app.module.ts
  :
import { TymModalModule } from "tym-modals";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymModalModule ],
  :
```

- 使い方:

``` html :app.component.html
  :
<npx-tym-modals></npx-tym-modals>
  :
※ 画面のどこかに1つ定義します。
```

``` typescript :app.component.ts
  :
import { TymModalService } from "tym-modals";
  :
  constructor(private modal: TymModalService) { }
  :
  // コンポーネント(<Component>)を表示します。
    let component_ref = this.modal.open(<Component>, provider);
  // 生成したコンポーネントにアクセスできます。
    let component = (component_ref?.instance as <Component>);
  // コンポーネントを非表示(破棄)にします。
    this.modal.close(); または component_ref.destroy();
  :
```

---

<br>

<a id="TymDialog"></a>

## 簡易メッセージダイアログ `(tym-dialog)`
<br>

簡易なメッセージダイアログを表示します。

- 使い方:

``` typescript :app.component.ts
// 必要なコンポーネントを定義します。
import { TymDialogComponent } from "tym-modals";
  :
  constructor(private modal: TymModalService) {
    // ボタンのIDと名称を定義します。
    TymDialogComponent.BUTTONS = [
      ['ok', 'OK'], ['cancel', 'キャンセル']
    ];
  }
  :
  open() {
    // ボタンのIDとアクション関数を定義します。
    const ok_button = { 'ok': () => {
      :
      this.modal.close();
    }
    const cancel_button = { 'cancel': () => {
      :
      this.modal.close();
    }
    // 表示内容をプロバイダーとして定義します。
    const provider = TymDialogComponent.provider(
      'メッセージのタイトル',
      ['メッセージ１', 'メッセージ２'],
      ok_button, cancel_button
    );
    // 簡易メッセージダイアログを表示します。
    this.modal.open(TymDialogComponent, provider);
  }
  :
```

``` typescript :app.component.ts
// 必要なコンポーネントを定義します。
import { TymDialogComponent } from "tym-modals";
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";
  :
  constructor(
    private modal: TymModalService,
    private sanitizer: DomSanitizer) { }
  trustHtmls(vals: any[]): SafeHtml[] {
    let safeHtml: SafeHtml[] = [];
    vals.forEach((v) => safeHtml.push(this.sanitizer.bypassSecurityTrustHtml(v)));
    return safeHtml;
  }
  :
  open() {
    const safeHtml: SafeHtml[] = this.trustHtmls(
      ['<b>太字</b>', '<span style="color:red">赤字</span>']);
    const provider = TymDialogComponent.provider(
      'メッセージのタイトル',
      safeHtml as string[]
    );
    // モーダレスで表示します。
    this.modal.open(TymDialogComponent, provider, true);
  }
  :
```

- 表示イメージ

![表示イメージ](/tym-dialog-demo.png)


![表示イメージ](/tym-dialog-demo2.png)

<br> 

---
### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
