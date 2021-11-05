
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

1. [簡易メッセージダイアログ](#簡易メッセージダイアログ)
1. [簡易コンテキストメニュー](#簡易コンテキストメニュー)
1. [ネストダイアログ／コンテキストメニュー](#ネストダイアログコンテキストメニュー)
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
    let component = (component_ref.instance as <Component>);
  // コンポーネントを非表示(破棄)にします。
  // ※ close() は 最後に open() されたコンポーネントを閉じます。
    this.modal.close(); または component_ref.destroy();
  :
  (または)
  :
  // コンポーネント(<Component>)を表示します。(promise inteface)
    let component_ref = await this.modal.open(
      <Component>,
      provider,
      true,  // true:モーダル, false:モーダレス
      (component_ref) => {
        // 生成したコンポーネントにアクセスできます。
        let component = (component_ref.instance as <Component>);
      });
  :
  (または)
  :
  // コンポーネント(<Component>)を表示します。(promise inteface)
    let promise = this.modal.open(..【省略】.., ()=>{});
    promise.then(
      (component_ref) => {
        // 生成したコンポーネントにアクセスできます。
        let component = (component_ref.instance as <Component>);
      }
    )
  :
```

---

<br>

> ## 簡易メッセージダイアログ

<br>

簡易なメッセージダイアログを表示します。

- 使い方1:

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
    const buttons = {
      'ok': (compo: TymDialogComponent) => {
        const compoRef = this.modal.getComponentRef(compo);
        :
        compoRef.destory();
        // this.modal.close();
      },
      'cancel': (compo: TymDialogComponent) => {
        const compoRef = this.modal.getComponentRef(compo);
        :
        compoRef.destory();
        // this.modal.close();
      }
    }
    // 表示内容をプロバイダーとして定義します。
    const provider = TymDialogComponent.provider(
      'メッセージのタイトル',
      ['メッセージ１', 'メッセージ２'],
      buttons
    );
    // 簡易メッセージダイアログを表示します。
    this.modal.open(TymDialogComponent, provider);
  }
  :
```

- 表示イメージ

![表示イメージ](/tym-dialog-demo.png)

<br>

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
    // モーダレスで表示します。(true:モーダル, false:モーダレス)
    let component_ref = this.modal.open(
      TymDialogComponent, provider, false);
    let component = (component_ref.instance as <TymDialogComponent>);
    // component.vals.title = 'title'; // タイトルを変更できます。
    // component.vals.messages = ['msg1', 'msg2']; // メッセージを変更できます。
  }
  :
```

- 表示イメージ2

![表示イメージ2](/tym-dialog-demo2.png)

<br>

- 使い方3:

``` scss :style.scss
ngx-tym-dialog footer button[name='cancel'] {
  background-color: #f00 !important;
  &:hover { background-color: #f60 !important; }
  &:active { background-color: #f40 !important; }
}
ngx-tym-dialog footer button[name='ok'] {
  background-color: #00f !important;
  &:hover { background-color: #06f !important; }
  &:active { background-color: #04f !important; }
}
※ スタイルシートはグローバルに設定します。
```

- 表示イメージ3

![表示イメージ2](/tym-dialog-demo4.png)

<br>

- 使い方4:

``` typescript :app.component.ts
  async open() {
    :
    let componentRef = await this.modal.open(
      TymDialogComponent, provider, false, ()=>{});
    let component = componentRef.instance as TymDialogComponent;
    if (component.actionId == 'ok') { }
    if (component.actionId == 'cancel' || component.actionId == '') { }
    ～ or ～
    this.modal.open(TymDialogComponent, provider, false,
      (componentRef) => {
        const component = componentRef.instance as TymDialogComponent;
        // タイトルを変更できます。
        //   component.vals.title = 'title';
        // メッセージを変更できます。
        //   component.vals.messages = ['msg1', 'msg2'];
      })
      .then(
        (componentRef) => {
          let component = componentRef.instance as TymDialogComponent;
          if (component.actionId == 'ok') { }
          if (component.actionId == 'cancel' || component.actionId == '') { }
        }
      )
```

---

<br>

> ## 簡易コンテキストメニュー

<br>

簡易コンテキストメニューを表示します。

- 使い方1:

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
    return false;
  }
  :
```

- 表示イメージ

![表示イメージ](/tym-menu-demo.png)

<br>

- 使い方2:

``` typescript :app.component.ts
    :
    this.modal.open(TymMenuComponent, provider, false, ()=>{})
      .then(
        (componentRef)=>{
          const component = componentRef.instance as TymMenuComponent;
          console.log(component.groupId, component.itemId);
        }
      );
    :
```

<br>

- 使い方3: メニュー項目にアイコンを表示

``` typescript :app.component.ts
  // アイコン用のクラス名を指定します。
    // 全てのメニュー項目を事前に定義しておきます。
    // * {<group-id>: {
    // *   '': [<group-name>, <icon-class-name's>],
    // *   <id>: [<name>, <icon-class-name's>],
    // *   ...}...}
    TymMenuComponent.MENU_DEFS = {
      'file': {
        // Font Awesome 5 Free利用の場合の例
        '': ['ファイル', 'far fa-file'],
        :
      },
      'folder': {
        :
        // 不要な場合は省略可
        'edit': '編集',
        // 独自画像などを指定する場合の例 
        'remove': ['削除', 'menu remove']
      }, ...
    };
```

``` scss
// 独自画像用のcssの例
.menu::before {
  width: 16px;
  height: 16px;
  background-image: url(~/tym-menu-icon.png);
  font: 16px monospace;
  content: '  ';
  white-space: pre-wrap;
  display: inline-block;
}
.copy::before {
  background-position-x: -0px;
}
.paste::before {
  background-position-x: -16px;
}
.move::before {
  background-position-x: -32px;
}
.remove::before {
  background-position-x: -48px;
}
```
iconイメージ ([16px] x [16px * n])  
![iconイメージ](/tym-menu-icon.png)

- 表示イメージ

![表示イメージ](/tym-menu-demo1.png)

<br>

- 使い方4: メニュー項目にアイコングループを表示

``` typescript :app.component.ts
    // 表示するアイコングループを指定します。
    // * [[<group-id>, <id>], ...]
    const icons: IconItems = [
      ['file', 'copy'], ['file','remove']
    ];
    :
    // 表示内容をプロバイダーとして定義します。
    const provider = TymMenuComponent.provider(
      menu,
      item_action,
      event.clientX, event.clientY,
      icons                  // アイコングループを指定します。
    );
    this.modal.open(TymMenuComponent, provider, false);
```

- 表示イメージ

![表示イメージ](/tym-menu-demo2.png)

---

> ## ネストダイアログ／コンテキストメニュー

<br>

ダイアログ／コンテキストメニューを連続して表示できます。

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
