
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
1. [簡易コンテキストメニュー](#TymMenu)
1. [ネストダイアログ／コンテキストメニュー](#ModalNest)
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
  // ※ close() は 最後に open() されたコンポーネントを閉じます。
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
    // ※ 必ずしも constructor で定義する必要はありません。
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

- 表示イメージ

![表示イメージ](/tym-dialog-demo.png)

- 使い方2:

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
    vals.forEach((v) => safeHtml.push(
      this.sanitizer.bypassSecurityTrustHtml(v)));
    return safeHtml;
  }
  :
  open() {
    const safeHtml: SafeHtml[] = this.trustHtmls(
      ['<b>太字</b>', '<span style="color:red">赤字</span>']);
    const provider = TymDialogComponent.provider(
      '', // タイトルなし
      safeHtml as string[]
          // ボタンなし
    );
    // モーダレスで表示します。
    let component_ref = this.modal.open(
      TymDialogComponent, provider, true);
    let component = (component_ref?.instance as <TymDialogComponent>);
    // component.vals.title = 'title'; // タイトルを変更できます。
    // component.vals.messages = ['msg1', 'msg2']; // メッセージを変更できます。
  }
  :
```

- 表示イメージ2

![表示イメージ2](/tym-dialog-demo2.png)

<br> 

---

<br>

<a id="TymMenu"></a>

## 簡易コンテキストメニュー `(tym-menu)`
<br>

簡易コンテキストメニューを表示します。

- 使い方:

``` typescript :app.component.ts
// 必要なコンポーネントを定義します。
import { TymMenuComponent } from "tym-modals";
  :
  constructor(private modal: TymModalService) {
    // 全てのメニュー項目を事前に定義しておきます。
    // * {<group-id>: {
    // *   '': <group-name>,
    // *   <id>: <name>,
    // *   ...}...}
    // ※ 必ずしも constructor で定義する必要はありません。
    TymMenuComponent.MENU_DEFS = {
      'file': {
        '': 'ファイル',
        'copy': 'コピー',
        'remove': '削除',
          :
      },
      'folder': {
        '': 'フォルダー',
        'copy': 'コピー',
        'remove': '削除',
          :
      }, ...
    };
  }
  :
  open(event: MouseEvent) {
    :
    // 表示するメニュー項目を定義します。
    // * [[[<group-id>, {false:show separator, true:show sub menu}],
    // *     [<id>, {false:disable, true:enable}], ...], ...]
    const menu: MenuItems = [
      [['file', true],
        ['copy', true], ['remove', false]],
      [['folder', false],
        ['copy', true], ['remove', false]],
    ];
    // アイテム選択時の関数を定義します。
    const item_action = (gid: string, id: string) => {
      :
    }
    // 表示内容をプロバイダーとして定義します。
    const provider = TymMenuComponent.provider(
      menu,
      item_action,
      event.clientX, event.clientY  // 表示位置を指定します。
    );
    this.modal.open(TymMenuComponent, provider, false);
    :
  }
  :
```

- 表示イメージ

![表示イメージ](/tym-menu-demo.png)

<br>

---

<a id="ModalNest"></a>

## 簡易コンテキストメニュー
<br>

簡易コンテキストメニューを表示します。

- 使い方:

``` typescript :app.component.ts
  :
    // 表示内容をプロバイダーとして定義します。
    const provider1 = TymDialogComponent.provider(
      'メッセージのタイトル .. 長い長い長い長い',
      ['メッセージ１', 'メッセージ２', 'メッセージ３', 'メッセージ４'],
      ok_button, cancel_button
    );
    this.modal.open(TymDialogComponent, provider1);

    // 表示内容をプロバイダーとして定義します。
    const provider2 = TymDialogComponent.provider(
      'メッセージのタイトル',
      ['メッセージ１', 'メッセージ２'],
      ok_button, cancel_button
    );
    // 簡易メッセージダイアログを表示します。
    this.modal.open(TymDialogComponent, provider2);
  :
```

- 表示イメージ

![表示イメージ](/tym-dialog-demo3.png)

---
### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
