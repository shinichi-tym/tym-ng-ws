import { Component, Output, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";
import {
  TYM_CUSTOM, TYM_FUNCS, TYM_DDDEF, TYM_COL, TYM_ORDER, TymTableComponent
} from "tym-table";
import { TymComm, TYM_COMM_LISTENER } from 'tym-directive';
import { TymModalService } from "tym-modals";
import { TymDialogComponent, TymMenuComponent, MenuItems, IconItems } from "tym-modals";
import { TymTreeComponent, TYM_TREE, TYM_LEAF, TYM_TREE_OPTION } from "tym-tree";
import { TymTableEditorComponent, TymTableInputComponent, TYM_EDITOR_DEF } from "tym-table-editor";
import { TymFormComponent, TYM_FORM_OPTS } from "tym-form";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'tym-ng-ws';
  private save_col_num: number = 4;
  private save_row_num: number = 4;

  @ViewChild("tymTable")
  private tymTable?: TymTableComponent;
  @ViewChild("tymTree1") private tymTree1?: TymTreeComponent;
  @ViewChild("tymTree2") private tymTree2?: TymTreeComponent;
  @ViewChild("tree_d0") private tree_d0?: TymTreeComponent;
  @ViewChild("tree_d1") private tree_d1?: TymTreeComponent;
  @ViewChild("tree_d2") private tree_d2?: TymTreeComponent;
  @ViewChild("tymform") private tymform?: TymFormComponent;
  @ViewChild("tymformmsg") private tymformmsg?: ElementRef;
  /////////////////////////////////////////////////////////////////////
  dragType: string = 'move';
  dropType: string = 'move';
  @Output() custom: TYM_CUSTOM = {}
  @Output() afnc: TYM_FUNCS = {
    doOrder: (order: string, col: number) => {
      this.odrmk = {
        order: (order == 'asc') ? 'desc' : 'asc',
        column: col
      }
      let f = (order == 'asc') ? -1 : 1;
      this.data = (this.data as number[][]).sort(function (a, b) { return (a[col] - b[col]) * f; });
      this.tymTable?.drowData(); // データ更新だけのため直接再描画を実行
    },
    doContext: (event: MouseEvent, num: number, row: any) => {
      this.menu(event);
      // alert("context menu\r\n" + num + " : " + JSON.stringify(this.data[num]));
      return false;
    },
    doClick: (event: MouseEvent, num: number, row: any) => {
      alert("click\r\n" + num + " : " + JSON.stringify(this.data[num]));
    }
  }
  @Output() dddef: TYM_DDDEF = {
    dragType: this.dragType as any,
    dropType: this.dropType as any,
    doDrop: (event: DragEvent, num: number, row: any) => {
      const fromnum = Number(event.dataTransfer?.getData('text/plain'));
      this.data.splice(num, 0, this.data.splice(fromnum, 1)[0]);
      this.tymTable?.drowData();
      this.tymTable?.setSelection([num]);
    }
  }
  @Output() cols: TYM_COL[] | any = [
    { title: "単価", width: "8em", align: "right", sortable: true, clickable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "10em", align: "right", sortable: true },
    { title: "注意事項", width: "10em", align: "left", sortable: false }
  ];
  @Output() data: any[][] | any = [
    [980, 627, 614460, ""],
    [1980, 1219, 2413620, ""],
    [2980, 116, 345680, "※備考参照:ここには注意事項が表示されます"],
    [3980, 616, 2451680, ""]
  ];
  @Output() odrmk: TYM_ORDER | any = {
    order: 'asc',
    column: 0
  };
  @Output() chkbox: boolean = true;
  @Output() lastsp: boolean = true;
  // @Output() autors: boolean = true;
  /////////////////////////////////////////////////////////////////////
  @Output() custom1: TYM_CUSTOM = {
    fontSize: "10px",
    headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
    headerBackground: "#829ebc linear-gradient(#829ebc,#225588)"
  }
  @Output() cols1: TYM_COL[] = [
    { title: "単価", width: "8em", align: "right", sortable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "12em", align: "right", sortable: true }
  ];
  @Output() data1: any[][] = [
    [980, 627, 614460],
    [1980, 1219, 2413620],
    [2980, 116, 345680]
  ];
  @Output() odrmk1: TYM_ORDER = {
    order: 'asc',
    column: 0
  };
  /////////////////////////////////////////////////////////////////////
  @Output() custom2: TYM_CUSTOM = {
    fontSize: "10px",
    headerBackground: "#444",
    headerBoxShadow: "#fff",
    bodyBoxShadow: "#fff",
    bodyColor: "000"
  }
  @Output() cols2: TYM_COL[] = [
    { title: "単価", width: "8em", align: "right", sortable: true },
    { title: "販売数", width: "8em", align: "right", sortable: true },
    { title: "売上", width: "12em", align: "right", sortable: true }
  ];
  @Output() data2: any[][] = [
    [980, 627, 614460],
    [1980, 1219, 2413620],
    [2980, 116, 345680]
  ];
  @Output() odrmk2: TYM_ORDER = {
    order: 'asc',
    column: 0
  };
  /////////////////////////////////////////////////////////////////////
  @Output() cols3: string[] = ["単価", "販売数", "売上", "注意事項"];
  @Output() data3: any[][] | any = [
    [980, 627, 614460, ""],
    [1980, 1219, 2413620, ""],
    [2980, 116, 345680, "※備考参照:ここには注意事項が表示されます"],
    [3980, 616, 2451680, ""]
  ];
  @Output() cols4: string[] = [];
  @Output() data4: any[][] | any = [];
  /////////////////////////////////////////////////////////////////////
  @Output() commListener: TYM_COMM_LISTENER = (id: string, data: any, elm: HTMLElement) => {
    elm.innerText = id + ":" + data;
  }
  @Output() TymCommPost = TymComm.post;
  @Output() Log = console.log;
  @Output() commdel = true;
  /////////////////////////////////////////////////////////////////////
  @Output() treeview1 = [
    'leaf-text1',
    'leaf-text2',
    [
      'leaf-text3',
      'leaf-text4',
      [
        'leaf-text5',
        'leaf-text-long-long-data',
      ],
      'leaf-text6',
    ],
    'leaf-text7',
  ];
  @Output() treeview2 = [
    'LEAF-TEXT1',
    [
      'LEAF-TEXT2',
      [
        'LEAF-TEXT3',
        [
          'LEAF-TEXT4',
        ]
      ]
    ],
    'LEAF-TEXT5',
    [
      'LEAF-TEXT6',
      'LEAF-TEXT7',
      [
        'LEAF-TEXT8',
        'LEAF-TEXT-LONG-LONG-DATA',
      ]
    ],
  ];
  @Output() treeviewsele = (texts: string[]) => this.treeviewret = texts.join('/');
  @Output() treeviewmenu = (texts: string[], event: MouseEvent) => {
    console.log(texts.join('/'), event);
    this.menu1(event);
    return false;
  }
  @Output() treeviewret: string = "-";
  /////////////////////////////////////////////////////////////////////
  @Output() tree1: TYM_TREE = [
    'leaf-text',
    'leaf-text',
    [
      'leaf-text',
      'leaf-text',
      [
        'leaf-text',
        'leaf-text-long-long-data',
      ]
    ],
    'leaf-text',
  ];
  @Output() tree2: TYM_TREE = [
    { text: 'leaf-text1', image: 'far fa-file-word' },
    {
      text: 'leaf-text2', children:
        [
          { text: 'leaf-text21', image: 'far fa-file-excel' },
          {
            text: 'leaf-text22', children:
              [
                { text: 'leaf-text221', image: 'far fa-file' },
              ]
          },
        ]
    },
    { text: 'leaf-text3', image: 'far fa-file-powerpoint' },
  ];
  private children = (idxs: number[], txts: string[]): Promise<any[]> => {
    let tree: any[] = [];
    const r = Math.floor(Math.random() * 10);
    for (let i = 0; i < r; i++) {
      tree.push({ text: this._mkwords(), children: this.children });
    }
    // tree = [{ text: 'leaf-text', children: this.children }];
    return new Promise((resolve, reject) => {
      const t = Math.floor((.2 + Math.random()) * 8) * 300;
      setTimeout(() => {
        resolve(tree);
      }, t);
    })
  }
  @Output() tree3: TYM_TREE = [
    { text: 'leaf-text', children: this.children },
    { text: 'leaf-text', children: this.children },
    { text: 'leaf-text', children: this.children },
  ];
  @Output() tree: TYM_TREE = [
    { text: 'data', },
    { text: 'long long long long long long long long long long long long', },
    {
      text: 'DATA', children: [
        {
          text: 'sub sub', children: [
            { text: 'sub sub sub', },
            { text: 'sub sub sub', },
            { text: 'sub sub sub', },
          ]
        },
        { text: 'sub sub', },
        { text: 'sub sub', },
        { text: 'long long long long long long long long long long long long', },
        { text: 'sub sub', },
        { text: 'sub sub', },
        { text: 'sub sub', },
      ]
    },
    { text: 'data', },
    { text: 'data', },
    { text: 'data', },
    { text: 'data', },
    { text: 'data', },
    { text: 'data', },
  ];
  @Output() tree_opt: TYM_TREE_OPTION = {
    doLeafOpen: (indexs: number[], texts: string[], leaf: any) => console.log('open', indexs, texts, leaf),
    doLeafClose: (indexs: number[], texts: string[], leaf: any) => console.log('close', indexs, texts, leaf),
    doDrawList: (indexs: number[], texts: string[], leaf: any) => console.log('list', indexs, texts, leaf),
    doContext: (indexs: number[], texts: string[], event: MouseEvent, leaf: any) => {
      console.log('menu', indexs, texts, leaf);
      this.menu(event);
      return false
    }
  }
  @Output() tree_opt_1: TYM_TREE_OPTION = {
    children:this.children,
  }
  /////////////////////////////////////////////////////////////////////
  constructor(
    private modal: TymModalService,
    private sanitizer: DomSanitizer) {
    TymComm.add('id1', (id: string, data: any, elm: any) => console.log('ABC: ' + data));
    TymComm.add('id1', (id: string, data: any, elm: any) => console.log('XYZ: ' + data));
    TymDialogComponent.BUTTONS = [
      ['ok', 'OK'], ['cancel', 'キャンセル']
    ];
  }
  trustHtmls(vals: any[]): SafeHtml[] {
    let safeHtml: SafeHtml[] = [];
    vals.forEach((v) => safeHtml.push(this.sanitizer.bypassSecurityTrustHtml(v)));
    return safeHtml;
  }
  doChange(event: any) {
    console.log('CustomEvent: ' + (event as CustomEvent).detail);
  }
  /////////////////////////////////////////////////////////////////////
  /** size 0x0 */
  fnc0x0(): void {
    this.cols = [];
    this.data = [];
    this.save_col_num = 0;
    this.save_row_num = 0;
    console.log("fnc0x0");
  }

  /** size 1x1 */
  fnc1x1(): void {
    this.cols = [
      { title: "単価", align: "right" }
    ] as TYM_COL[];
    this.data = [
      [980],
    ];
    this.save_col_num = 1;
    this.save_row_num = 1;
    console.log("fnc1x1");
  }

  /** size 1x1 width:100 */
  fnc1x1w100(): void {
    this.cols = [
      { title: "単価", width: "100px", align: "right" }
    ] as TYM_COL[];
    this.data = [
      [980],
    ];
    this.save_col_num = 1;
    this.save_row_num = 1;
    console.log("fnc1x1w100");
  }

  /** size 3x3 width */
  fnc3x3(): void {
    this.cols = [
      { title: "単価", width: "10em", align: "right", sortable: true },
      { title: "販売数", width: "8em", align: "right", sortable: true },
      { title: "売上", width: "12em", align: "right", sortable: true }
    ] as TYM_COL[];
    this.data = [
      [980, 627, 614460],
      [1980, 1219, 2413620],
      [2980, 116, 345680]
    ];
    this.odrmk = {
      order: 'asc',
      column: 0
    }
    this.save_col_num = 3;
    this.save_row_num = 3;
    console.log("fnc3x3");
  }

  _mkcols(cols: number): TYM_COL[] {
    let _cols: TYM_COL[] = [];
    for (let index_c = 0; index_c < cols; index_c++) {
      let wordnum: number = Math.floor(Math.random() * 3) + 1;
      let headsize: number = Math.floor(Math.random() * 5) + 5;
      let words: string = '';
      for (let index = 0; index < wordnum; index++) {
        words += ' ' + Math.random().toString(36).replace(/[^a-z]+/g, '')
          .substr(0, (Math.floor(Math.random() * 8) + 3));
      }
      _cols.push({ title: words.substring(1), width: headsize + "rem" });
    }
    return _cols;
  }

  _mkdata(cols: number, rows: number): (string[][]) {
    let data: string[][] = [];
    for (let index_r = 0; index_r < rows; index_r++) {
      let row = [];
      for (let index_c = 0; index_c < cols; index_c++) {
        row.push(this._mkwords());
      }
      data.push(row);
    }
    return data;
  }

  _mkwords(): string {
    let wordnum: number = Math.floor(Math.random() * 3) + 1;
    let words: string = '';
    for (let index = 0; index < wordnum; index++) {
      words += ' ' + Math.random().toString(36).replace(/[^a-z]+/g, '')
        .substring(0, (Math.floor(Math.random() * 12) + 3));
    }
    return words.substring(1);
  }

  fnc5x5(): void {
    this.save_col_num = 5;
    this.save_row_num = 5;
    this.cols = ["col1", "col2", "col3", "col4", "col5"];
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc5x5");
  }
  fnc10x20(): void {
    this.save_col_num = 10;
    this.save_row_num = 20;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc10x20");
  }
  fnc20x20(): void {
    this.save_col_num = 20;
    this.save_row_num = 20;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc20x20");
  }
  fnc100x20(): void {
    this.save_col_num = 100;
    this.save_row_num = 20;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc100x20");
  }
  fnc20x100(): void {
    this.save_col_num = 20;
    this.save_row_num = 100;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc20x100");
  }
  fnc100x100(): void {
    this.save_col_num = 100;
    this.save_row_num = 100;
    this.cols = this._mkcols(this.save_col_num);
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("fnc100x100");
  }
  update(): void {
    this.data = this._mkdata(this.save_col_num, this.save_row_num);
    console.log("update");
  }
  sample(): void {
    let org = false;
    if (this.custom.headerBackground) {
      if (this.custom.headerBackground.startsWith("#829ebc")) {
        org = true;
      }
    }
    this.custom = (org)
      ? {
        fontSize: "1rem", bodyBoxPadding: ".4rem",
        headerBoxShadow: "1px 1px 3px 0 #cccccc inset",
        headerBackground: "#888888 linear-gradient(#888888, #666666)"
      }
      : {
        fontSize: "14px", bodyBoxPadding: ".2rem",
        headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
        headerBackground: "#829ebc linear-gradient(#829ebc,#225588)"
      }
  }
  setCustom(): void {
    let inputs = document.querySelectorAll<HTMLInputElement>('#cust input');
    let custom: TYM_CUSTOM = {};
    for (let index = 0; index < inputs.length; index++) {
      const element = inputs[index];
      const elm_val = element.value;
      const elm_td = element.parentElement?.previousElementSibling as HTMLElement;
      const elm_id = elm_td.innerText;
      console.log(elm_id)
      Object.assign(custom, { [elm_id]: elm_val });
    }
    this.custom = custom;
    let dddef: TYM_DDDEF = {
      dragType: this.dragType as any,
      dropType: this.dropType as any,
      doDragStart: this.dddef.doDragStart,
      doDragEnd: this.dddef.doDragEnd,
      doDragEnter: this.dddef.doDragEnter,
      doDragOver: this.dddef.doDragOver,
      doDrop: this.dddef.doDrop
    }
    this.dddef = dddef;
    console.log("setCustom");
  }

  chkbox1() {
    this.chkbox = !this.chkbox;
  }

  lastsp1() {
    this.lastsp = !this.lastsp;
  }

  getsel() {
    console.log(this.tymTable?.getSelection());
  }

  anyTest() {
    this.tymTable?.setSelection([1,2]);
    TymComm.post('id1', 'POST DATA!');
    // this.tymTable?.setSelection([0,1,2,3]);
    // this.tymTable?.clearSelection();
  }

  open() {
    // const ok_button = { 'ok': () => this.modal.close() }
    // const cancel_button = { 'cancel': () => this.modal.close() }
    const buttons = {
      ok: () => this.modal.close(),
      cancel: () => this.modal.close()
    }
    const safeHtml: SafeHtml[] = this.trustHtmls([
      `〇〇〇を<b style="color:red">△◇△◇△◇</b>します。`,
      `SAMPLE`
    ]);
    const provider = TymDialogComponent.provider(
      '〇△◇の確認',
      safeHtml as string[],
      buttons
      // ok_button, cancel_button
    );
    this.modal.open(TymDialogComponent, provider);
  }

  async open1() {
    // const ok_button = { 'ok': () => this.modal.close() }
    // const cancel_button = { 'cancel': () => this.modal.close() }
    const buttons = {
      'ok': (compo: TymDialogComponent) => {
        const compoRef = this.modal.getComponentRef(compo);
        compoRef!.destroy();
        // this.modal.close();
      },
      'cancel': (compo: TymDialogComponent) => {
        const compoRef = this.modal.getComponentRef(compo);
        compoRef!.destroy();
        // this.modal.close();
      }
    };
    const provider = TymDialogComponent.provider(
      'メッセージのタイトル .. モーダレスダイアログ',
      ['メッセージ１', 'メッセージ２', 'メッセージ３', '閉じると次のダイアログが表示される'],
      buttons
      // ok_button, cancel_button
    );

    let componentRef = await this.modal.open(
      TymDialogComponent, provider, false,
      (componentRef) => {
        const compo = componentRef.instance as TymDialogComponent;
        compo.vals.title += ' 1st';
        compo.vals.messages[2] = "ダイアログ表示時にタイトルとメッセージを更新"
        console.log(compo.vals);
      });
    let component = componentRef.instance as TymDialogComponent;
    if (component.actionId == 'ok') { }
    if (component.actionId == 'cancel' || component.actionId == '') { }

    let promise = this.modal.open(
      TymDialogComponent, provider, false,
      (componentRef) => {
        const compo = componentRef.instance as TymDialogComponent;
        compo.vals.title += " 2nd";
        compo.vals.messages[1] = "ダイアログ表示時にタイトルとメッセージを更新"
        console.log(compo.vals);
      });
    await promise.then(
      (componentRef) => {
        const compo = componentRef.instance as TymDialogComponent;
        compo.vals.title += " 3rd";
        compo.vals.messages[3] = "ダイアログを重ねて表示"
        console.log(compo.vals);
      });

    this.modal.open(TymDialogComponent, provider, false, () => { })
      .then(
        (componentRef) => {
          let component = componentRef.instance as TymDialogComponent;
          if (component.actionId == 'ok') { }
          if (component.actionId == 'cancel' || component.actionId == '') { }
        }
      )

    const provider2 = TymDialogComponent.provider(
      'メッセージのタイトル .. モーダレスダイアログ',
      ['メッセージ１', '3秒後にさらに表示', 'その後2秒後に閉じる'],
      buttons
    );
    let component_ref = this.modal.open(TymDialogComponent, provider2, false);
    setTimeout(() => {
      const provider = TymDialogComponent.provider(
        'メッセージのタイトル',
        ['下層のダイアログが', '閉じられる'],
        buttons
        // ok_button, cancel_button
      );
      this.modal.open(TymDialogComponent, provider, false);
    }, 3000);
    setTimeout(() => { component_ref.destroy() }, 5000);
  }

  open2() {
    const safeHtml: SafeHtml[] = this.trustHtmls(
      ['タイトルなし＆スタイル設定', '<b>太字</b>', '<span style="color:red">赤字</span>', '3秒後にメッセージ更新!']);
    const provider = TymDialogComponent.provider(
      '',
      safeHtml as string[]
    );
    let component_ref = this.modal.open(TymDialogComponent, provider, true);
    // 生成したコンポーネントにアクセスできます。
    let component = (component_ref.instance as TymDialogComponent);
    // コンポーネントを非表示(破棄)にします。
    // this.modal.close(); または component_ref.destroy();
    setTimeout(() => {
      component.vals.messages=["自動的に閉じます"];
      setTimeout(() => component_ref.destroy(), 2000);
    }, 3000);
  }

  menu(event: MouseEvent): boolean { //PointerEvent,MouseEvent
    event.stopPropagation();
    const menu: MenuItems = [
      [['file', true],
        ['copy', true], ['remove', true], ['edit', false]],
      [['folder', false],
        ['copy', true], ['remove', true], ['edit', false]],
    ];
    if (Math.random() > .5) {
      // スクロール確認
      for (let index = 0; index < 40; index++) {
        menu[1].push(menu[1][1])
      }
    }
    TymMenuComponent.MENU_DEFS = {
      'file': {
        '': 'ファイル',
        'copy': 'コピー',
        'edit': '編集',
        'remove': '削除'
      },
      'folder': {
        '':'フォルダー',
        'copy': 'コピー',
        'edit': '編集',
        'remove': '削除'
      },
    };
    const provider = TymMenuComponent.provider(
      menu,
      (gid: string, id: string) => {
        console.log(gid, id);
      },
      event.clientX, event.clientY + 20
    );
    let prom = this.modal.open(TymMenuComponent, provider, false, (componentRef) => {
      const element = componentRef.location.nativeElement as HTMLElement;
      element.style.setProperty('--bs-sz', '16px');
    });
    prom.then(
      (v) => {
        console.log(v)
      }
    );
    return false;
  }

  menu1(event: MouseEvent): boolean {
    this.menu12async(event,1);
    return false;
  }
  menu2(event: MouseEvent): boolean {
    this.menu12async(event,2);
    return false;
  }
  async menu12async(event: MouseEvent, n:number) { //PointerEvent,MouseEvent
    event.stopPropagation();
    const menu: MenuItems = (n == 1)
      ? [[['file', true],
          ['copy', true], ['remove', true], ['edit', false]],
        [['folder', false],
          ['copy', true], ['remove', true], ['edit', false]]]
      : [[['file', false],
          ['copy', true], ['remove', true], ['edit', true]]];
    const icon: IconItems = (n == 1)
      ? []
      : [['file', 'copy'], ['file', 'remove']];
    TymMenuComponent.MENU_DEFS = {
      'file': {
        '': ['ファイル', 'far fa-file'],   // Font Awesome 5 Free利用の場合の例
        'copy': ['コピー', 'far fa-copy'], // Font Awesome 5 Free利用の場合の例
        'edit': ['編集', 'far fa-edit'],                    // 不要な場合は省略
        'remove': ['削除','far fa-trash-alt'],
      },
      'folder': {
        '':'フォルダー',
        'copy': 'コピー',
        'edit': '編集',
        'remove': ['削除', 'menu remove']  // 独自画像などを指定する場合の例 
      },
    };
    const provider = TymMenuComponent.provider(
      menu,
      (gid: string, id: string) => {
        console.log(gid, id);
      },
      event.clientX, event.clientY + 20,
      icon
    );
    let componentRef = await this.modal.open(TymMenuComponent, provider, false, (componentRef) => {
      const element = componentRef.location.nativeElement as HTMLElement;
      element.style.setProperty('--bs-sz', (n == 1) ? '20px' : '24px');
    });
    console.log(componentRef);
  }

  //-----------------------------------------------------------------
  private leaf_d!: TYM_LEAF;
  private get_leaf_d = (indexs: number[]) => {
    const idxlen = indexs.length;
    const g = (tree_d: TYM_TREE, level: number): [TYM_TREE, TYM_LEAF] => {
      const n = indexs[level];
      const leaf = tree_d[n] as TYM_LEAF;
      level++;
      return (level < idxlen) ? g(leaf.children as TYM_TREE, level) : [tree_d, leaf];
    }
    return g(this.tree_d, 0);
  }
  private leaf_err() {
    const provider = TymDialogComponent.provider(
      '',
      ['移動できません(can\'t move)']
    );
    let component_ref = this.modal.open(TymDialogComponent, provider, true);
    // 生成したコンポーネントにアクセスできます。
    let component = (component_ref.instance as TymDialogComponent);
    setTimeout(() => component_ref.destroy(), 2000);
  }
  @Output() tree_d: TYM_TREE = [
    { text: 'leaf-text1', data: [[111111, 112, 113, ''], [114, 115, 116, '']] },
    {
      text: 'leaf-text2', data: [[221, 222222, 223, ''], [224, 225, 226, '']], children:
        [
          { text: 'leaf-text2-1', data: [[2111, 2112, 2113, '']] },
          {
            text: 'leaf-text2-2', data: [[2211, 2212, 2213, '']], children:
              [
                { text: 'leaf-text2-2-1', data: [[22111, 22112, 22113, '※注意']] },
              ]
          },
        ]
    },
    { text: 'leaf-text3', data: [[331, 332, 333333, ''], [334, 335, 336, '']] },
  ];
  @Output() option_d: TYM_TREE_OPTION = {
    dragType: 'none',
    dropType: 'move',
    doDrawList: (indexs: number[], texts: string[], leaf: any) => {
      console.log('list', indexs, texts, leaf);
      [, this.leaf_d] = this.get_leaf_d(indexs);
      this.data_d = this.leaf_d.data;
    },
    doDrop: (event: DragEvent, indexs: number[], texts: string[], leaf: any) => {
      console.log('drop', indexs, texts, leaf);
      const rowidx = parseInt(event.dataTransfer?.getData('text/plain') as string);
      const rowData = (this.leaf_d.data as any[]).splice(rowidx, 1);
      this.data_d = this.leaf_d.data = [...this.leaf_d.data];
      [, this.leaf_d] = this.get_leaf_d(indexs);
      for (let i = 0; i < rowData.length; i++) {
        (this.leaf_d.data as any[]).push(rowData[i]);
      }
    }
  }
  @Output() option_d2: TYM_TREE_OPTION = {
    dragType: 'none',
    dropType: 'move',
    doDrop: (event: DragEvent, indexs: number[], texts: string[], leaf: any) => {
      console.log('drop', indexs, texts, leaf);
      const leaf_fr_idxstr = event.dataTransfer?.getData('text/plain') as string;
      const leaf_to_idxsstr = indexs.join(',');
      console.log(leaf_fr_idxstr, leaf_to_idxsstr, leaf_fr_idxstr?.startsWith(leaf_to_idxsstr))
      if (leaf_to_idxsstr?.startsWith(leaf_fr_idxstr)) { this.leaf_err(); return; }
      const leaf_fr_idxs = leaf_fr_idxstr?.split(',').map(s => parseInt(s)) as number[]
      if (leaf_fr_idxs.length <= 1) { this.leaf_err(); return; }
      const [tree_fr, leaf_fr] = this.get_leaf_d(leaf_fr_idxs);
      const [, leaf_to] = this.get_leaf_d(indexs);
      if (!leaf_to.children) leaf_to.children = [];
      (leaf_to.children as TYM_TREE).push(leaf_fr);
      leaf_fr_idxs.pop();
      tree_fr.splice(tree_fr.findIndex(l => l == leaf_fr), 1)
      this.tree_d1?.clearTree(leaf_fr_idxs);
      // this.tree_d1?.openTree(leaf_fr_idxs);
      this.tree_d2?.clearTree(indexs);
      this.tree_d2?.openTree(indexs);
    }
  }
  @Output() cols_d: TYM_COL[] = [
    { title: "単価", width: "8em", align: "right" },
    { title: "販売数", width: "8em", align: "right" },
    { title: "売上", width: "10em", align: "right" },
    { title: "注意事項", width: "10em", align: "left" }
  ];
  @Output() data_d: any[][] | any = [];

  private getTI(v: string) {
    return [(document.getElementById('radio1') as HTMLInputElement).checked
      ? this.tymTree1 : this.tymTree2, JSON.parse(`[${v}]`)];
  }
  tree_open(v: any) {
    const [tree, indexs] = this.getTI(v.value);
    tree?.openTree(indexs);
    // tree?.openTree(indexs, true);
  }
  clear_tree(v: any) {
    const [tree, indexs] = this.getTI(v.value);
    tree?.clearTree(indexs);
  }
  update_tree(v: any, t: any) {
    const [tree, indexs] = this.getTI(v.value);
    const [tree2, n] = TymTreeComponent.getTree(this.tree, indexs);
    if (tree2 != null) {
      const leaf = tree2[n];
      if (typeof leaf == 'string') {
        tree2[n] = t.value;
      } else {
        (leaf as TYM_LEAF).text = t.value;
      }
      // tree.updateLeafText(indexs, t.value);
      tree.clearTree(indexs.slice(0,-1));
    } else {
      console.log('@@ err');
    }
  }
  remove_leaf(v: any) {
    const [tree, indexs] = this.getTI(v.value);
    tree?.removeLeaf(indexs);
  }

  clear_tree2() {
    setTimeout(() => this.tree_d0?.clearTree());
    setTimeout(() => this.tree_d1?.clearTree());
    setTimeout(() => this.tree_d2?.clearTree());
  }

  @Output() resizeCallback(thisElm: HTMLElement, parentElm: HTMLElement) {
    parentElm.style.border = "solid 1px red";
    parentElm.style.width = thisElm.clientWidth * 1.5 + "px";
    parentElm.style.height = thisElm.clientHeight * 1.5 + "px";
  }

  @ViewChild("tymTableEditor")
  private tymTableEditor?: TymTableEditorComponent;

  private editinput = async (elm: HTMLElement, val: string, type?: string, col?: number): Promise<string | null> => {
    const provider = TymTableInputComponent.provider(type || 'text', val, elm);
    const componentRef = await this.modal.open(TymTableInputComponent, provider, false, () => { });
    const component = componentRef.instance as TymTableInputComponent;
    return (component.vals.isEscape) ? null : component.vals.ret;
  }
  private viewfnc = (val: string, type?: string, col?: number): string => {
    let ret = val;
    switch (type) {
      case 'number':
        ret = /^[+,-]?([0-9]\d*|0)$/.test(val) ? parseInt(val).toLocaleString() : val;
        break;
      case 'numberedit':
        ret = /^[+,-]?([0-9]\d*|0)$/.test(val) ? parseInt(val).toLocaleString() : val;
        break;
      case 'date':
        ret = ((d = new Date(val)) => (!isNaN(d.getTime())) ? (d.toISOString().split("T")[0]).replace(/-/g, '/') : val)();
        break;
      default:
        break;
    }
    return ret;
  }

  @Output() defs: TYM_EDITOR_DEF[] = [
    { col: 1, align: 'left' },
    { col: 2, align: 'center' },
    {
      col: 3, align: 'right', type: 'number', viewfnc: this.viewfnc
    },
    {
      col: 4, type: 'xyz', viewfnc: (val: string, type?: string, col?: number) => {
        return (val) ? '<' + val + '>' : '';
      }
    },
    { col: 5, align: 'right', type: 'number', editfnc: this.editinput },
    { col: 6, align: 'center', type: 'date', editfnc: this.editinput },
    { col: 7, align: 'center', type: 'datetime-local', editfnc: this.editinput },
    { col: 8, align: 'center', type: 'time', editfnc: this.editinput },
    { col: 9, align: 'left', type: 'tel', editfnc: this.editinput },
    { col: 10, align: 'left', type: 'email', editfnc: this.editinput },
    { col: 11, align: 'right', type: 'range', editfnc: this.editinput },
  ];
  @Output() editordata = () => {
    return [
      ['data 1', 'data 2', 123,     '', 'number', 'date', 'datetime-local', 'time', 'tel', 'email', 'range'],
      ['3',      '4',      12345,   'data data data data 4'],
      ['',       '',       1234567, 'data data data data data 5']
    ];
  }
  @Output() reset_data() {
    this.tymTableEditor?.setData(this.editordata());
  }
  @Output() editor_out() {
    console.log('editor_out');
    let data: string[][] = [], rows: string[] = [];
    const fnc = (row: number, col: number, val: string, eol?: boolean) => {
      console.log(`row=${row},col=${col},val=${val},eol=${eol}`);
      rows.push(val);
      if (eol) {
        data.push([...rows]);
        rows = [];
      }
    }
    this.tymTableEditor?.getCells(3, 3, fnc);
    console.log(data);
  }
  @Output() editor_menu = (event: MouseEvent, row1: number, col1: number, row2: number, col2: number) => {
    console.log(event,row1,col1)
    const menu: MenuItems = [
      [['row', true],
       ['insert', true], ['remove', true]],
      [['colins', true],
       ['text', true], ['number', true], ['numberedit', true], ['date', true]],
      [['colremove', false],
       ['colremove', true]],
      [['cell', false],
       ['copy', true], ['paste', true], ['clear', true]],
      [['other', false],
       ['undo', true], ['redo', true]],
    ];
    TymMenuComponent.MENU_DEFS = {
      'row': {
        '': '行',
        'insert': '行挿入',
        'remove': '行削除'
      },
      'colins': {
        '': '列挿入',
        'text': 'テキスト',
        'number': '数値',
        'numberedit': '数値(編集有)',
        'date': '日付',
      },
      'colremove': {
        '': '列削除',
        'colremove': '列削除',
      },
      'cell': {
        '': 'セル',
        'copy': 'コピー',
        'paste': '貼り付け',
        'clear': '消去',
      },
      'other': {
        '': 'その他',
        'undo': '元に戻す',
        'redo': 'やり直す',
      },
    };
    const provider = TymMenuComponent.provider(
      menu,
      (gid: string, id: string) => {
        switch (gid) {
          case 'row':
            switch (id) {
              case 'insert':
                this.tymTableEditor?.insertRow(row1);
                break;
              case 'remove':
                this.tymTableEditor?.removeRow(row1);
                break;
            }
            break;
          case 'colins':
            switch (id) {
              case 'text':
                this.tymTableEditor?.insertCol(col1);
                break;
              case 'number':
                this.tymTableEditor?.insertCol(col1,
                  { col: col1, type: 'number', align: 'right', viewfnc: this.viewfnc });
                break;
              case 'numberedit':
                this.tymTableEditor?.insertCol(col1,
                  { col: col1, type: 'number', align: 'right', viewfnc: this.viewfnc, editfnc: this.editinput });
                break;
              case 'date':
                this.tymTableEditor?.insertCol(col1,
                  { col: col1, type: 'date', align: 'center', viewfnc: this.viewfnc, editfnc: this.editinput });
                break;
            }
            break;
          case 'colremove':
            this.tymTableEditor?.removeCol(col1);
            break;
          case 'cell':
            switch (id) {
              case 'copy':
                this.tymTableEditor?.copy();
                break;
              case 'paste':
                this.tymTableEditor?.paste();
                break;
              case 'clear':
                this.tymTableEditor?.delete();
                break;
            }
            break;
          case 'cell':
            switch (id) {
              case 'undo':
                this.tymTableEditor?.undo();
                break;
              case 'redo':
                this.tymTableEditor?.redo();
                break;
            }
            break;
        }
      },
      event.clientX, event.clientY
    );
    this.modal.open(TymMenuComponent, provider, false);
    event.stopPropagation();
    return true;
  }
  @Output() set_data() {
    let data: string[][] = [], rows: string[] = [];
    const r = Math.floor(Math.random() * 130 + 1);
    const c = Math.floor(Math.random() * 130 + 1);
    for (let i = 0; i < r; i++) {
      rows = [];
      for (let j = 0; j < c; j++) {
        rows.push(this._mkwords());
      }
      data.push([...rows]);
    }
    this.tymTableEditor?.setData(data);
    console.log(this.tymTableEditor?.getData(r, c));
  }
  @Output() set_range() {
    let data: string[][] = [], cols: string[] = [];
    const rn = Math.floor(Math.random() * 5 + 1);
    const cn = Math.floor(Math.random() * 5 + 1);
    const r = Math.floor(Math.random() * 5 + 1);
    const c = Math.floor(Math.random() * 5 + 1);
    for (let i = 0; i < rn; i++) {
      cols = [];
      for (let j = 0; j < cn; j++) {
        cols.push(this._mkwords());
      }
      data.push([...cols]);
    }
    this.tymTableEditor?.setData(data, r, c);
    console.log(this.tymTableEditor?.getData(r, c, r + rn - 1, c + cn - 1));
  }
  @Output() clear_data() {
    this.tymTableEditor?.setData([['']]);
  }
  @Output() insert_row() {
    this.tymTableEditor?.insertRow(2);
  }
  @Output() remove_row() {
    this.tymTableEditor?.removeRow(2);
  }
  @Output() insert_col() { this.tymTableEditor?.insertCol(2); }
  @Output() remove_col() { this.tymTableEditor?.removeCol(2); }
  @Output() text_copy() { this.tymTableEditor?.copy(); }
  @Output() text_paste() { this.tymTableEditor?.paste(); }
  @Output() text_delete() { this.tymTableEditor?.delete(); }
  @Output() text_undo() { this.tymTableEditor?.undo(); }
  @Output() text_redo() { this.tymTableEditor?.redo(); }

  @Output() panel1() { this.tymform!.formTextUrl = './assets/panel1.txt'; }
  @Output() panel2() { this.tymform!.formTextUrl = './assets/panel2.txt'; }
  @Output() open_panel() {
    const provider = TymFormComponent.provider(
      {}, '', './assets/panel00.txt', {},
      (event: MouseEvent, vals: any, varname: string) => {
        let msg;
        if (varname == 'close') {
          msg = JSON.stringify(compo.vals);
          componentRef!.destroy();
        } else if (varname.startsWith('b')) {
          msg = `click: ${varname}`;
        } else {
          msg = JSON.stringify(compo.vals);
          compo.formTextUrl = `./assets/${varname}.txt`;
        }
        this.tymformmsg!.nativeElement!.innerText = msg;
      },
      (event: KeyboardEvent, vals: any, varname: string) => { }
    );
    let componentRef = this.modal.open(TymFormComponent, provider, true);
    const element = componentRef.location.nativeElement as HTMLElement;
    const compo = componentRef.instance as TymFormComponent;
    compo.loading.then(_ => compo.formTextUrl = './assets/panel01.txt');
  }
  @Output() open_panel2() {
    const provider = TymFormComponent.provider(
      {}, ['123456789+123456789+123456789+123456789+',
        'プロポーショナルフォント\t[a\t]',
        'proportional font\t[b\t]',
        '[DEF]',
        'a:font1:text:::::::',
        'b:font2:text:::::::'].join('\n'), '',
      { fontFamily: 'system-ui', tabSize: '25', zoom: '85%', borderLines: [0, 1, 2, 3] });
    let componentRef = this.modal.open(TymFormComponent, provider, false);
    const compo = componentRef.instance as TymFormComponent;
    setTimeout(() => {
      const compo = componentRef.instance as TymFormComponent;
      compo.opts = { borderLines: [] }
      compo.formTextUrl = './assets/panel3.txt';
    }, 4000);
  }
  @ViewChild("tymformx") private tymformx?: TymFormComponent;
  @ViewChild("tymformxdef") private tymformxdef?: ElementRef;
  @ViewChild("tymformxtext") private tymformxtext?: ElementRef;
  @Output() tymformx_set() {
    const textareadef = this.tymformxdef?.nativeElement as HTMLTextAreaElement;
    const textareatext = this.tymformxtext?.nativeElement as HTMLTextAreaElement;
    this.tymformx!.formText = textareadef.value;
    this.tymformx!.formText = textareatext.value;
  }
  @Output() formopts = {}
  @Output() formbutton = (event: MouseEvent, vals: any, varname: string) =>
    this.tymformmsg!.nativeElement!.innerText = JSON.stringify(vals);
  @Output() formenter = (event: KeyboardEvent, vals: any, varname: string) =>
    this.tymformmsg!.nativeElement!.innerText = JSON.stringify(vals);
  @Output() setFormCustom() {
    let inputs = document.querySelectorAll<HTMLInputElement>('#formcust input');
    let opts: TYM_FORM_OPTS = {};
    for (let index = 0; index < inputs.length; index++) {
      const element = inputs[index];
      let elm_val:any = element.value;
      const elm_td = element.parentElement?.previousElementSibling as HTMLElement;
      const elm_id = elm_td.innerText;
      if (elm_id == 'borderLines') elm_val = elm_val.split(',').map((s: string) => parseInt(s)) as number[]
      Object.assign(opts, { [elm_id]: elm_val });
    }
    this.formopts = opts;
  }
  @Output() formCustom(n: number) {
    let inputs = document.querySelectorAll<HTMLInputElement>('#formcust input');
    const fontColor = ['#000', '#000', '#fff'];
    const backgroundColor = ['#eff', '#fff', '#123'];
    const borderColor = ['#888', 'transparent', '#123'];
    const formBorder = ['dotted 1px #ccc', 'solid 1px #000', 'dashed 1px #123'];
    const borderLines = ['', '2,3,4,5,6,7,8,9,10,12', '']
    for (let index = 0; index < inputs.length; index++) {
      const element = inputs[index];
      const elm_td = element.parentElement?.previousElementSibling as HTMLElement;
      const elm_id = elm_td.innerText;
      if (elm_id == 'fontColor') element.value = fontColor[n];
      if (elm_id == 'backgroundColor') element.value = backgroundColor[n];
      if (elm_id == 'borderColor') element.value = borderColor[n];
      if (elm_id == 'formBorder') element.value = formBorder[n];
      if (elm_id == 'borderLines') element.value = borderLines[n];
    }
    this.setFormCustom();
  }
}
