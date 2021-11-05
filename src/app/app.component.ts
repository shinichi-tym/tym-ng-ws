import { Component, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";
import {
  TYM_CUSTOM, TYM_FUNCS, TYM_DDDEF, TYM_COL, TYM_ORDER, TymTableComponent
} from "tym-table";
import { TymComm, TYM_COMM_LISTENER } from 'tym-directive';
import { TymModalService } from "tym-modals";
import { TymDialogComponent, TymMenuComponent, MenuItems, IconItems } from "tym-modals";

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
      this.open3(event);
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
        let wordnum: number = Math.floor(Math.random() * 3) + 1;
        let words: string = '';
        for (let index = 0; index < wordnum; index++) {
          words += ' ' + Math.random().toString(36).replace(/[^a-z]+/g, '')
            .substr(0, (Math.floor(Math.random() * 12) + 3));
        }
        row.push(words.substring(1));
      }
      data.push(row);
    }
    return data;
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
    let inputs = document.getElementsByTagName('input');
    let custom: TYM_CUSTOM = {};
    for (let index = 0; index < inputs.length; index++) {
      const element = inputs[index];
      const elm_val = element.value;
      const elm_id = element.parentElement?.previousSibling?.firstChild?.nodeValue;
      switch (elm_id) {
        case 'fontFamily':
          custom.fontFamily = elm_val;
          break;

        case 'fontSize':
          custom.fontSize = elm_val;
          break;

        case 'borderColor':
          custom.borderColor = elm_val;
          break;

        case 'headerBackground':
          custom.headerBackground = elm_val;
          break;

        case 'headerColor':
          custom.headerColor = elm_val;
          break;

        case 'headerBoxShadow':
          custom.headerBoxShadow = elm_val;
          break;

        case 'bodyColor':
          custom.bodyColor = elm_val;
          break;

        case 'bodyBoxShadow':
          custom.bodyBoxShadow = elm_val;
          break;

        case 'bodyBoxPadding':
          custom.bodyBoxPadding = elm_val;
          break;

        case 'bodyEvenColor':
          custom.bodyEvenColor = elm_val;
          break;

        case 'bodyOddColor':
          custom.bodyOddColor = elm_val;
          break;

        case 'bodySeldColor':
          custom.bodySeldColor = elm_val;
          break;

        case 'bodyHovrColor':
          custom.bodyHovrColor = elm_val;
          break;

        default:
          break;
      }
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
      'メッセージのタイトル .. 長い長い長い長い',
      ['メッセージ１', 'メッセージ２', 'メッセージ３', 'メッセージ４'],
      buttons
      // ok_button, cancel_button
    );

    let componentRef = await this.modal.open(
      TymDialogComponent, provider, false,
      (componentRef) => {
        const compo = componentRef.instance as TymDialogComponent;
        compo.vals.title+=" 1st";
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
        console.log(compo.vals);
      });
    await promise;

    this.modal.open(TymDialogComponent, provider, false, () => { })
      .then(
        (componentRef) => {
          let component = componentRef.instance as TymDialogComponent;
          if (component.actionId == 'ok') { }
          if (component.actionId == 'cancel' || component.actionId == '') { }
        }
      )

    let component_ref = this.modal.open(TymDialogComponent, provider, false);
    setTimeout(() => {
      const provider = TymDialogComponent.provider(
        'メッセージのタイトル',
        ['メッセージ１', 'メッセージ２'],
        buttons
        // ok_button, cancel_button
      );
      this.modal.open(TymDialogComponent, provider, false);
    }, 5000);
    setTimeout(() => { component_ref?.destroy() }, 8000);

    // // 表示内容をプロバイダーとして定義します。
    // const provider1 = TymDialogComponent.provider(
    //   'メッセージのタイトル .. 長い長い長い長い',
    //   ['メッセージ１', 'メッセージ２', 'メッセージ３', 'メッセージ４'],
    //   buttons
    //   // ok_button, cancel_button
    // );
    // this.modal.open(TymDialogComponent, provider1);

    // // 表示内容をプロバイダーとして定義します。
    // const provider2 = TymDialogComponent.provider(
    //   'メッセージのタイトル',
    //   ['メッセージ１', 'メッセージ２'],
    //   buttons
    //   // ok_button, cancel_button
    // );
    // // 簡易メッセージダイアログを表示します。
    // this.modal.open(TymDialogComponent, provider2);

  }

  open2() {
    const safeHtml: SafeHtml[] = this.trustHtmls(
      ['<b>太字</b>', '<span style="color:red">赤字</span>']);
    const provider = TymDialogComponent.provider(
      '',
      safeHtml as string[]
    );
    let component_ref = this.modal.open(TymDialogComponent, provider, false);
    // 生成したコンポーネントにアクセスできます。
    let component = (component_ref.instance as TymDialogComponent);
    // コンポーネントを非表示(破棄)にします。
    // this.modal.close(); または component_ref.destroy();
    setTimeout(() => {
      component.vals.messages=["メッセージ"];
    }, 5000);
  }

  open3(event: MouseEvent): boolean { //PointerEvent,MouseEvent
    event.stopPropagation();
    const menu: MenuItems = [
      [['file', true],
        ['copy', true], ['remove', true], ['edit', false]],
      [['folder', false],
        ['copy', true], ['remove', true], ['edit', false]],
    ];
    // // スクロール確認
    // for (let index = 0; index < 40; index++) {
    //   menu[1].push(menu[1][1])
    // }
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
    let prom = this.modal.open(TymMenuComponent, provider, false, () => { });
    prom.then(
      (v) => {
        console.log(v)
      }
    );
    return false;
  }

  open4(event: MouseEvent): boolean {
    this.open45async(event,4);
    return false;
  }
  open5(event: MouseEvent): boolean {
    this.open45async(event,5);
    return false;
  }
  async open45async(event: MouseEvent, n:number) { //PointerEvent,MouseEvent
    event.stopPropagation();
    const menu: MenuItems = (n == 4)
      ? [[['file', true],
          ['copy', true], ['remove', true], ['edit', false]],
        [['folder', false],
          ['copy', true], ['remove', true], ['edit', false]]]
      : [[['file', false],
          ['copy', true], ['remove', true], ['edit', true]]];
    const icon: IconItems = (n == 4)
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
    let componentRef = await this.modal.open(TymMenuComponent, provider, false, () => { });
    console.log(componentRef);
  }

  @Output() resizeCallback(thisElm: HTMLElement, parentElm: HTMLElement) {
    parentElm.style.border = "solid 1px red";
    parentElm.style.width = thisElm.clientWidth * 1.5 + "px";
    parentElm.style.height = thisElm.clientHeight * 1.5 + "px";
  }
}
