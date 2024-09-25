
# `[tym-tree]`
`tym-tree` は，`angular` の簡易なツリー構造データの表示コンポーネントです。

<br>

表示サンプル (Display image)

![表示サンプル](/tym-tree-demo1.png)

動作イメージ (Demo screen)

[https://shinichi-tym.github.io/tym-ng-ws-demo/index.html#tym-tree]

## インストール `(Installation)`
<br>

次のコマンド実行します。
```
npm install tym-tree
```

<br>

> ## 基本的な使い方 `(Basic usage)`

<br>

表示される場所に`<ngx-tym-tree>`タグを作成します。

``` html
  :
  <ngx-tym-tree #tymTree
    style="width:300px;height:200px;border:solid 1px #888;"
    [tree]="tree"
    [option]="option"
  ></ngx-tym-tree>
  :
```

コンポーネントを利用できるようにします。

``` typescript :app.module.ts
  :
import { TymTreeModule } from "tym-tree";
  :
@NgModule({
  declarations: [ .. ],
  imports: [ TymTreeModule ],
  :
```

コンポーネントの機能を利用できるようにします。

``` typescript :app.component.ts
  :
import { tymTreeComponent } from "tym-tree";
  :
  @ViewChild("tymTree")
  private tymTree?: tymTreeComponent;
  :
  // クリアを実行
  this.tymTree?.clearTree();
```

表示するためのデータを用意します。

``` typescript
import { TYM_TREE, TYM_LEAF, TYM_TREE_OPTION } from "tym-tree";
  :
  let tree: TYM_TREE = [
    'leaf-text',
    'leaf-text',
    [
      'leaf-text',
      'leaf-text',
      [
        'leaf-text',
      ]
    ],
    'leaf-text',
  ];
  let option: TYM_TREE_OPTION = {}
```

<br> 

---

<br>

> ## 機能 `(Features)`

<br>

- [基本機能](#基本機能) (Basic Function)
- [静的文字列データ表示](#静的文字列データ表示) (Static string data display)
- [静的リーフデータ表示](#静的リーフデータ表示) (Static leaf data display)
- [動的データ表示１](#動的データ表示１) (Dynamic data display 1)
- [動的データ表示２](#動的データ表示２) (Dynamic data display 2)
- [アイコン表示](#アイコン表示) (Show icon)
- [開閉イメージ非表示](#開閉イメージ非表示) (Hides open / closed images)
- [開閉イベント](#開閉イベント) (Open / Close event)
- [コンテキストイベント](#コンテキストイベント) (Contextmenu event)
- [リスト表示イベント](#リスト表示イベント) (Draw list event)
- [ドラッグアンドドロップイベント](#ドラッグアンドドロップイベント) (Drag and Drop event)
- [表示のカスタマイズ](#表示のカスタマイズ) (Customization)

<br>

- [公開関数](#公開関数) (Public Functions)

<br>

---

<br>

> ### 基本機能

- `tree`, `option` 値を指定すると，その値に従ってツリー構造データを表示します。
- 開閉イメージをクリックすると，下位階層を表示・非表示します。
- 開閉イメージが非表示の場合，アイコンが表示されていると，アイコンをクリックすると，下位階層を表示・非表示します。
- リーフをダブルクリックすると，下位階層を表示・非表示します。
- ツリーはフォーカス対象です。TABキーでフォーカスが設定されます。
- リーフにフォーカスがあるとき
  - 下矢印を押下すると，フォーカスを下に移動します，
  - 上矢印を押下すると，フォーカスを上に移動します。
  - 下位階層が非表示で，右矢印を押下すると下位階層を表示します。
  - 下位階層が表示で，右矢印を押下すると下位階層にフォーカス移動します。
  - 下位階層が表示で，左矢印を押下すると下位階層を非表示にします。
  - 下位階層が非表示で，左矢印を押下すると上位階層にフォーカス移動します。
- リーフの長い文字も，ホバーで表示します。
- `tree` を変更した場合は，再描画関数で再描画する必要があります。

<br>

- [定義]
``` html
<ngx-tym-tree
    [tree]="tree"
    [option]="option"
><ngx-tym-tree>
```
- `tree: TYM_TREE`
``` typescript
/**
 * リーフデータ
 */
export interface TYM_LEAF {
  /** リーフに表示する文字 */
  text: string;
  /** リーフごとにアイコンを表示する時のクラス文字列 */
  image?: string;
  /** 子リーフの配列 または 子リーフ取得用関数 */
  children?: TYM_TREE | ((indexs: number[], texts: string[]) => Promise<TYM_TREE>);
}

/**
 * ツリーデータ
 */
export type TYM_TREE = (string | TYM_LEAF | TYM_TREE)[];
```
- `option: TYM_TREE_OPTION`
``` typescript
/**
 * オプションデータ
 */
export interface TYM_TREE_OPTION {
  /** 子リーフ取得用関数 (TYM_LEAF.childrenは無視する) */
  children?: (indexs: number[], texts: string[]) => Promise<TYM_TREE>;
  /** 初期表示時の開く階層 ( 0 ～ 5 ) */
  open_level?: number;
  /** 開閉用のマークを非表示する場合にtrueを指定する */
  no_open_close_image?: boolean;
  /**
   * リーフごとのアイコンを表示する時のクラス文字列
   * - open/close/子リーフなし で指定する
   * - 文字列を指定した場合は 全て同じアイコンを表示する
   */
  images?: string | {
    open: string;
    close: string;
    none?: string;
  }
  /** リーフオープンアクションの関数を定義, 規定値: { } */
  doLeafOpen?: (indexs: number[], texts: string[], leaf?: any) => void;
  /** リーフクローズアクションの関数を定義, 規定値: { } */
  doLeafClose?: (indexs: number[], texts: string[], leaf?: any) => void;
  /** リスト表示アクションの関数を定義, 規定値: { } */
  doDrawList?: (indexs: number[], texts: string[], leaf?: any) => void;
  /** コンテキストアクションの関数を定義, 規定値: true */
  doContext?: (indexs: number[], texts: string[], event: MouseEvent, leaf?: any) => boolean;

  /** ドラッグタイプ(effectAllowed), 規定値: none */
  dragType?: 'none' | 'copy' | 'move' | 'copyMove';
  /** ドロップ効果(dropEffect), 規定値: none */
  dropType?: 'none' | 'copy' | 'move';
  /** ドラッグ開始時の関数を定義 */
  doDragStart?: (event: DragEvent, indexs: number[], texts: string[], leaf?: any) => void;
  /** ドラッグ終了時の関数を定義, 規定値: { } */
  doDragEnd?: (event: DragEvent, indexs: number[], texts: string[], leaf?: any) => void;
  /** ドロップターゲットに入った時の関数を定義 */
  doDragEnter?: (event: DragEvent, indexs: number[], texts: string[], leaf?: any) => void;
  /** ドロップターゲットの上にある時の関数を定義 */
  doDragOver?: (event: DragEvent, indexs: number[], texts: string[], leaf?: any) => void;
  /** ドロップターゲットにドロップされた時の関数を定義, 規定値: { } */
  doDrop?: (event: DragEvent, indexs: number[], texts: string[], leaf?: any) => void;

}
/* 規定値 */
doDragStart(event: DragEvent, indexs: number[], texts: string[], leaf?: any) {
  event.dataTransfer?.setData('text/plain', idxs.toString());
  event.dataTransfer?.setData('application/json', JSON.stringify({ idxs, txts }));
  event.dataTransfer!.effectAllowed = this.dragType as any;
}
dragEnterOrOver(event: DragEvent, indexs: number[], texts: string[], leaf?: any) {
  event.preventDefault();
  if (this._dd_def.dropType != event.dataTransfer?.effectAllowed) {
    if (event.dataTransfer?.effectAllowed == 'copyMove') {
      event.dataTransfer!.dropEffect = this._dd_def.dropType as any;
    } else {
      event.dataTransfer!.dropEffect = 'none';
    }
  } else {
    event.dataTransfer!.dropEffect = this._dd_def.dropType as any;
  }
}
doDragEnter = dragEnterOrOver;
doDragOver = dragEnterOrOver;
```

<br>

---

<br>

> ### 静的文字列データ表示

<br>

- 静的な文字列データを表示できます。

``` typescript
  // static string data
  let tree: TYM_TREE = [
    'leaf-text',
    'leaf-text',    // <= ここの子データとして
    [               // <= ここのデータが表示されます
      'leaf-text',
      'leaf-text',
      [
        'leaf-text',
      ]
    ],
    'leaf-text',
  ];
```

<br>

> ### 静的リーフデータ表示

<br>

- 静的なリーフ形式データ(`TYM_LEAF`)を表示できます。

``` typescript
  // static leaf data
  let tree: TYM_TREE = [
    { text: 'leaf-text', },
    { text: 'leaf-text',        // <= ここの子データとして
      children: [               // <= ここのデータが表示されます
        { text: 'leaf-text', },
        { text: 'leaf-text',
          children: [
            { text: 'leaf-text', },
        ] },
      ] },
    { text: 'leaf-text', },
  ];
```

<br>

> ### 動的データ表示

<br>

- 動的なデータを表示できます。
- `children` は，下位階層が一度も取得されていない時，  
  ・ 下位階層を表示するタイミングで呼び出されます。
- `children` は，下位階層が一度取得されている時，  
  ・ リーフをダブルクリックしたタイミングで呼び出されます。  
  ・ フォーカスのあるリーフでスペースキーを押下したタイミングで呼びされます。

``` typescript
  //////////////////////////////////////////////////
  // ※ 下位階層の取得関数を定義
  //////////////////////////////////////////////////
  // get dynamic data
  let children = (indexs: number[], texts: string[], leaf?: any) => Promise<TYM_TREE> {
    return new Promise((resolve, reject) => {
      let tree: TYM_TREE;
      :
      resolve(tree);
    });
  };

  //////////////////////////////////////////////////
  // ※ リーフごとに取得関数で定義
  //////////////////////////////////////////////////
  // dynamic data
  let tree: TYM_TREE = [
    { text: 'leaf-text', children: children },
    { text: 'leaf-text', children: children },
    { text: 'leaf-text', children: [ ... ] },   // 子は静的データ
    { text: 'leaf-text', },     // 子データなし
  ];

  //////////////////////////////////////////////////
  // ※ リーフごとに取得関数で定義
  //////////////////////////////////////////////////
  // option
  let option: TYM_TREE_OPTION = {
    children: children
  }
  // static data
  let tree = [
    'leaf-text',
    'leaf-text',
    'leaf-text',
  ];
  // or //
  let tree: TYM_TREE = [
    { text: 'leaf-text', },
    { text: 'leaf-text', },
    { text: 'leaf-text', children: children },    // children は無視されます
  ];

```

<br>

> ### アイコン表示

<br>

- `option.images` を設定することでアイコンを表示できます。
- リーフごとに `image` を設定することでアイコンを表示できます。

``` typescript
  //Font Awesome 5 Free利用の場合の例
  let option: TYM_TREE_OPTION = {
    images: {
      open: 'far fa-folder-open', // フォルダー開アイコン
      close: 'far fa-folder',     // フォルダー閉アイコン
      none: 'far fa-file',        // ファイルアイコン
    }
  }
  // or //
  let option: TYM_TREE_OPTION = {
    images: 'far fa-folder-open',
  }
  // or //
  let tree: TYM_TREE = [
    { text: 'leaf-text', image: 'far fa-file-word' },
    { text: 'leaf-text', image: 'far fa-file-excel' },
    { text: 'leaf-text', image: 'far fa-file-file' },
  ];
```

<br>

> ### 初期表示時の開く階層

<br>

- `option.open_level` に 1 ～ 5 を設定することで初期表示時に指定分の階層を開きます。

<br>

---

> ### 開閉イメージ非表示

<br>

- `option.no_open_close_image` に `false` を設定することで開閉イメージを非表示にできます。

<br>

---

<br>

> ### 開閉イベント

<br>

- `option.doLeafOpen` に イベント関数を設定します。
- `option.doLeafClose` に イベント関数を設定します。
- リーフが開閉する時に実行されます。
- 開閉イメージをクリックすると開閉します。
- 開閉イメージが非表示でアイコンをクリックすると開閉します。
- リーフをダブルクリックすると開閉します。
- フォーカス行で左右矢印キーの押下で開閉します。

<br>

---

<br>

> ### コンテキストイベント

<br>

- `option.doContext` に イベント関数を設定します。
- 右クリックすると実行されます。
- `tree` を変更した場合は，再描画関数で再描画する必要があります。

<br>

---

<br>

> ### リスト表示イベント

<br>

- `option.doDrawList` に イベント関数を設定します。
- マウスクリック時に実行されます。
- マウスダブルクリック時も最初のクリック時に実行されます。
- フォーカス行でスペースキーを押下すると実行されます。

<br>

---

> ### ドラッグアンドドロップイベント

<br>

- `option` の `dragType`, `dropType`, `doDragStart`, `doDragEnd`, `doDragEnter`, `doDragOver`, `doDrop` に 必要なイベント関数を設定します。
- `tree` を変更した場合は，再描画関数で再描画する必要があります。

<br>

---

<br>

> ### 表示のカスタマイズ

<br>

- [表示のカスタマイズ](#表示のカスタマイズ) (Color Customization)

``` scss
ngx-tym-tree {
  // アイコン/フォントサイズを指定する
  --bs-sz: 16px !important;
  // フォーカス行のバックグラウンドカラーを指定する
  --fc-co: #cef !important;
  // フォーカス行のボーダーカラーを指定する。
  --fc-bc: #888 !important;
  // ホバー行のバックグラウンドカラーを指定する
  --ho-co: #eff !important;
  // ホバー行のボーダーカラーを指定する。
  --ho-bc: #444 !important;

  // フォントファミリーを変更する場合に指定する
  font-family: "Meiryo UI", "MS PGothic", sans-serif !important;
  // フォントカラーを変更する場合に指定する
  color: #000 !important;
  // バックグラウンドカラーを指定する
  background-color: #fff !important;
}

※ スタイルシートはグローバルに設定します。
```

<br>

---

<br>

> ### 公開関数

<br>

> #### 階層を開く関数

<br>

    let opened = await openTree(indexs); 
    let opened = await openTree(indexs, force); 

- 指定した，階層ごとのインデックス番号をもとに，階層を開く。

- [引数]
  - indexs: number[]
    - 開く場所を，階層ごとのインデックス番号で指定します。
    - 例) [1,2,0]  
      TOP階層の1番目,その中の階層の2番目,その中の0番目を開く
  - force: boolean
    - true  : 階層を開く際に `tree` から再描画する。
    - false : 階層を開く際に，未描画の場合だけ `tree` から再描画する(省略値)。

- [戻値]
  - opened: boolean
    - true  : 全て開けた場合
    - false : 開けなかった場合

<br>

> #### 階層をクリアする関数

<br>

    clearTree()
    clearTree(indexs)

- 指定した，階層ごとのインデックス番号の下位階層をクリアし，再描画する。

- [引数]
  - indexs: number[]
    - クリアする場所を，階層ごとのインデックス番号で指定する。
    - 省略した場合は，TOP階層からクリアする。

- [戻値]
  - なし

<br>

---

<br>

> #### (描画済みの)リーフを削除する関数

<br>

    removeLeaf(indexs);

- 指定した，階層ごとのインデックス番号のリーフとその下位階層を削除する。
- 画面上の描画データだけを削除する。
- `tree` から削除されていなければ，再描画時に再度描画される。

- [引数]
  - indexs: number[]
    - 削除する場所を，階層ごとのインデックス番号で指定する。
    - 省略([])した場合は何もしない。

- [戻値]
  - なし

<br>

---

> #### (描画済みの)リーフのテキストを更新する関数

<br>

    updateLeafText(indexs, text);

- 指定した，階層ごとのインデックス番号のリーフのテキストを更新する。
- 画面上の描画データだけを削除する。
- `tree` が更新されていなければ，再描画時に再度描画される。

- [引数]
  - indexs: number[]
    - 更新する場所を，階層ごとのインデックス番号で指定する。
    - 対象が存在しない場合は何もしない。
  - text: string
    - 設定するテキスト

- [戻値]
  - なし

<br>

---

<br>

> #### リーフデータを取得する関数

<br>

    let [subtree, index] = TymTreeComponent.getTree(tree, indexs);

- スタティックな `tree` から，指定した，階層ごとのインデックス番号の `subtree` と `index` を求める。
- 求めたリーフは次のようなイメージで更新できる。  
  ` // static strings `  
  ` subtree[index] = 'update text'; `  
  ` // static leaf objects `  
  ` subtree[index].text = 'update text'; `  
  ` subtree[index] = {text: 'update text'}; `
- 変更した場合は，再描画関数で再描画する必要がある。  
  ` // update drawing text `  
  ` updateLeafText(indexs, 'update text'); `  
  ` // redraw tree `  
  ` clearTree(indexs.slice(0,-1)); `  

- [引数]
  - tree: TYM_TREE
    - 描画に利用している `tree`。
  - indexs: number[]
    - 求める `subtree` を，階層ごとのインデックス番号で指定する。

- [戻値]
  - subtree: TYM_TREE | null
    - `tree` の部分ツリー，存在しない場合は `null`
  - index: number
    - `subtree` に対するインデックス番号。

<br>

---

<br>

その他の表示サンプル (Display image)

![表示サンプル2](/tym-tree-demo2.png)

![表示サンプル3](/tym-tree-demo3.png)

![表示サンプル4](/tym-tree-demo4.png)

![表示サンプル5](/tym-tree-demo5.png)

![表示サンプル6](/tym-tree-demo6.png)

---
### `comments`
```text
* supports angular 16, 17 and 18.
```
---
### ライセンス (License)
The components in tym-ng-ws are released under the MIT license. [Read license](//github.com/shinichi-tym/tym-ng-ws/blob/main/LICENSE).

---
Copyrights belong to shinichi tayama (shinichi.tym).
