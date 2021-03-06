/*!
 * tym-form.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { Inject, InjectionToken, StaticProvider } from '@angular/core';
import { Component, Input, ElementRef, Renderer2, HostBinding } from '@angular/core';

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

type DEF = {
  id: string,
  varname: string,
  type: string,
  inputmode: string,
  pattern: string,
  required: string,
  placeholder: string,
  title: string,
  line: number,
  option: string[],
}

@Component({
  selector: 'ngx-tym-form',
  template: `<pre></pre><form></form>`,
  styleUrls: ['./tym-form.component.scss']
})
export class TymFormComponent {

  /**
   * FORM用トークン
   */
  public static TYM_FORM_TOKEN = new InjectionToken<any>('TymForm');

  private static idnum = 0;

  public loading: Promise<string> = new Promise<string>(() => { });
  private _defmap = new Map<string, DEF>();

  private _thisElm: HTMLElement; // this table element
  private _bkuptext: string = '';
  private _borderLines: number[] = [];

  @HostBinding('style.--fm-bo') protected formBorder!: string;
  @HostBinding('style.--fm-co') protected formFontColor!: string;
  @HostBinding('style.--fm-bg') protected formBackgroundColor!: string;
  @HostBinding('style.--fm-ol') protected formFocusOutline!: string;
  @HostBinding('style.--fm-ib') protected formInvalidBorder!: string;

  @Input() vals: { [name: string]: string | string[] } = {}

  @Input() set opts(opts: TYM_FORM_OPTS) {
    if (!opts) return;
    const thisElm = this._thisElm;
    const style = thisElm.style;
    const {
      zoom, fontColor, fontFamily, tabSize, lineHeight16px,
      borderStyle, borderColor, backgroundColor,
      formBorder, formFontColor, formBackgroundColor,
      formFocusOutline, formInvalidBorder } = opts;
    if (fontColor) style.color = fontColor;
    if (fontFamily) style.fontFamily = fontFamily;
    if (tabSize) style.tabSize = tabSize;
    style.lineHeight = (lineHeight16px?.toString() == 'true') ? '16px' : '';
    setTimeout(() => {
      const pre = thisElm.firstElementChild as HTMLPreElement;
      const form = thisElm.lastElementChild as HTMLFormElement;
      const prestyle = pre.style;
      if (borderStyle) prestyle.borderStyle = borderStyle;
      if (borderColor) prestyle.borderColor = borderColor;
      if (backgroundColor) prestyle.backgroundColor = backgroundColor;
      if (zoom) {
        prestyle.transform = form.style.transform = `scale(${zoom})`;
      }
    });
    //---------------------------------------------------------------
    if (formBorder) this.formBorder = formBorder;
    if (formFontColor) this.formFontColor = formFontColor;
    if (formBackgroundColor) this.formBackgroundColor = formBackgroundColor;
    if (formFocusOutline) this.formFocusOutline = formFocusOutline;
    if (formInvalidBorder) this.formInvalidBorder = formInvalidBorder;
    this._borderLines = opts.borderLines ?? [];
    this._createForm(this._bkuptext);
  }

  @Input() set formText(text: string) { this._createForm(text) }

  @Input() set formTextUrl(url: string) { this._setTextUrl(url) }

  @Input() button = (event: MouseEvent, vals: any, varname: string) => { }

  @Input() enter = (event: KeyboardEvent, vals: any, varname: string) => { }

  /**
   * コンストラクタ
   *
   * @param {ElementRef} _elmRef このディレクティブがセットされたDOMへの参照
   * @param {Renderer2} _renderer DOMを操作用
   * @param {any} _vals StaticProviderのuseValue値
   * @memberof TymFormComponent
   */
  constructor(
    private _elmRef: ElementRef,
    private _renderer: Renderer2,
    @Inject(TymFormComponent.TYM_FORM_TOKEN) private _vals: any,
  ) {
    this._thisElm = this._elmRef.nativeElement as HTMLElement;
    if (_vals.vals) {
      this.vals = _vals.vals;
      if (_vals.opts) this.opts = _vals.opts;
      if (_vals.button) this.button = _vals.button;
      if (_vals.enter) this.enter = _vals.enter;
      if (_vals.text) this._createForm(_vals.text);
      if (_vals.texturl) this._setTextUrl(_vals.texturl);
      Object.assign(this._thisElm.style, {
        width: 'min-content',
        height: 'min-content',
        maxWidth: 'calc(100vw * .8)',
        maxHeight: 'calc(100vh * .8)',
        margin: 'auto',
        position: 'fixed',
        border: 'solid 1px #ccc',
        borderRadius: '4px',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: '#fff',
        padding: '8px',
      } as CSSStyleDeclaration);
    }
  }

  /**
   * borderLinesから罫線用のタグを作成する
   */
  private _createBorderLines() {
    const pre = this._thisElm.firstElementChild as HTMLPreElement;
    const { lineHeight } = window.getComputedStyle(pre);
    const borderLines = this._borderLines;
    const create_div_element = () => this._renderer.createElement('div') as HTMLDivElement;
    let div1 = pre.nextElementSibling as HTMLDivElement;
    if (div1 && div1.tagName == 'DIV') {
      while (div1?.firstChild) { div1.removeChild(div1.firstChild); }
    } else {
      div1 = this._thisElm.insertBefore(create_div_element(), div1);
    }
    const div1Style = div1.style;
    div1Style.width = `${pre.clientWidth - 16}px`;
    div1Style.height = `${pre.clientHeight - 16}px`;
    div1Style.transform = pre.style.transform;
    const maxlinenum = Math.max(...borderLines);
    for (let index = 1; index <= maxlinenum; index++) {
      const div = div1.appendChild(create_div_element());
      const divStyle = div.style;
      divStyle.height = lineHeight;
      divStyle.boxSizing = 'border-box';
      if (borderLines.indexOf(index) >= 0) {
        divStyle.borderBottom = 'solid 1px #ccc';
      }
    }
    if (div1.firstElementChild && borderLines.indexOf(0) >= 0) {
      (div1.firstElementChild as HTMLElement).style.borderTop = 'solid 1px #ccc';
    }
  }

  /**
   * urlからformテキストを読み込み表示する
   * @param url url文字列
   * @returns Promise<string>
   */
  private async _setTextUrl(url: string) {
    if (!url) return Promise.resolve('err');
    this.loading = fetch(url).then(res => {
      if (res.ok) {
        let p = res.text();
        p.then(text => {
          this._createForm(text);
          return Promise.resolve('ok');
        });
        return p;
      } else {
        this._createForm(`load error.\r\n${url}`);
        return Promise.resolve('err');
      }
    });
    return this.loading;
  }

  /**
   * formテキストを表示する
   * @param text formテキスト
   */
  private _createForm(text: string) {
    if (text) {
      const [txt, def] = text.split('[DEF]', 2);
      if (def != undefined) this._createDefMap(def);
      if (txt.trim() != '') setTimeout(() => this._createView(txt));
    }
  }

  /**
   * 定義文字列から定義情報(map)を作成する
   * @param defstext 定義文字列
   */
  private _createDefMap(defstext: string) {
    if (!defstext) return;
    //---------------------------------------------------------------
    // ..
    this._defmap.clear();
    defstext.split(/\r\n|\n/)?.forEach(def => {
      //{id}:{var name}:{type}:{inputmode}:{pattern}:{required}:{placeholder}:{title}:{line}:{option}
      const [_id, varname, type, inputmode, pattern, required, placeholder, title, line, option] = def.split(':');
      const id = _id.trim();
      if (id == '' || id[0] == '#') return;
      this._defmap.set(id, {
        id: id,
        varname: varname?.trim(),
        type: type?.trim(),
        inputmode: inputmode?.trim(),
        pattern: pattern?.trim(),
        required: required?.trim(),
        placeholder: placeholder?.trim(),
        title: title?.trim(),
        line: parseInt(line?.trim()) || 1,
        option: option?.trim().split(','),
      })
    });
  }

  /**
   * 画面テキストと定義データから画面を表示する
   * @param viewtext 画面テキスト
   */
  private _createView(viewtext: string) {
    if (!viewtext) return;
    //---------------------------------------------------------------
    // ..
    const { vals, _thisElm, _defmap, _renderer } = this;
    const pre = _thisElm.firstElementChild as HTMLPreElement;
    const form = _thisElm.lastElementChild as HTMLFormElement;
    while (form.firstChild) form.removeChild(form.firstChild);
    const { lineHeight } = window.getComputedStyle(pre);
    //---------------------------------------------------------------
    // ..
    const create_text = (txt: string) => _renderer.createText(txt);
    const create_element = (elm: string) => _renderer.createElement(elm);
    const create_input_element = (type: string) => {
      const elm = create_element('input') as HTMLInputElement;
      elm.type = type;
      return elm;
    }
    const create_textarea_element = () => create_element('textarea') as HTMLInputElement;
    const create_label_element = () => create_element('label') as HTMLLabelElement;
    const create_span_element = () => create_element('span') as HTMLSpanElement;
    const create_select_element = () => create_element('select') as HTMLSelectElement;
    const create_datalist_element = () => create_element('datalist') as HTMLDataListElement;
    const create_option_element = () => create_element('option') as HTMLOptionElement;
    /****************************************************************
     * valsにメンバ変数/値を設定する
     * @param varname 変数名文字列
     * @param val 設定する値
     * @returns 
     */
    const set_prop = (varname: string, val: any) => {
      if (vals.hasOwnProperty(varname) || val != '') vals[varname] = val;
    }
    /****************************************************************
     * keypressイベントでEnterイベントを登録する
     * @param elm エレメント
     * @param def タグ用定義
     */
    const make_enter_event = (elm: HTMLElement, def: DEF) => {
      elm.addEventListener('keypress', e => {
        if (e.key == 'Enter') this.enter(e, vals, def.varname);
      });
    }
    /****************************************************************
     * input/textarea タグを作成する
     * @param def タグ用定義
     * @param type タグタイプ
     * @returns エレメント
     */
    const make_input_elm = (def: DEF, type: string) => {
      const input = (def.line > 1)
        ? create_textarea_element()
        : create_input_element(type);
      input.name = def.varname;
      input.addEventListener('change', e => {
        const _input = e.target as HTMLInputElement;
        set_prop(def.varname, _input.value);
      });
      make_enter_event(input, def);
      if (def.inputmode) input.inputMode = def.inputmode;
      if (def.pattern) input.pattern = def.pattern;
      if (def.required) input.required = (def.required == 'y');
      if (def.placeholder) input.placeholder = def.placeholder;
      if (def.title) input.title = def.title;
      if (def.option && def.type == 'datalist') {
        const idName = '_tymform-' + TymFormComponent.idnum++;
        input.setAttribute('list', idName);
        const dl = create_datalist_element();
        dl.id = idName;
        def.option.forEach(o => {
          const option = create_option_element();
          option.value = o;
          option.appendChild(create_text(o));
          dl.appendChild(option);
        });
        form.appendChild(dl);
      }
      if (def.varname && vals && type != 'password') {
        if (vals.hasOwnProperty(def.varname)) {
          input.value = vals[def.varname] as string;
        }
      }
      return input;
    }
    /****************************************************************
     * input type=checkbox/radio タグを作成する
     * @param def タグ用定義
     * @param type タグタイプ
     * @returns エレメント
     */
    const make_check_elm = (def: DEF, type: string) => {
      const span = create_span_element();
      make_enter_event(span, def);
      const selvals: string[] =
        (vals?.hasOwnProperty(def.varname)) ? vals[def.varname] as string[] : [];
      def.option?.forEach(o => {
        const label = create_label_element();
        const input = create_input_element(type);
        input.addEventListener('change', e => {
          let rets: string[] = [];
          span.querySelectorAll('input').forEach(e => {
            if (e.checked) rets.push(e.value);
          });
          set_prop(def.varname, rets);
        });
        input.name = def.varname;
        input.value = o;
        if (selvals.indexOf(o) >= 0) input.checked = true;
        label.appendChild(input);
        label.appendChild(create_text(o));
        span.appendChild(label);
        span.appendChild(create_text(' '));
      });
      return span;
    }
    /****************************************************************
     * input type=file タグを作成する
     * @param def タグ用定義
     * @param type タグタイプ
     * @returns エレメント
     */
    const make_file_elm = (def: DEF, type: string) => {
      const msg = def.option[0] || 'select file ...';
      const label = create_label_element();
      label.tabIndex = 0;
      label.style.fontSize = '75%';
      const input = create_input_element(type);
      input.name = def.varname;
      const text = create_text(msg);
      make_enter_event(label, def);
      label.addEventListener('keypress', e => {
        if (e.key == ' ') {
          input.dispatchEvent(new MouseEvent('click'));
          e.preventDefault();
        }
      });
      input.addEventListener('change', e => {
        setTimeout(() => {
          text.nodeValue = input.value || msg;
          set_prop(def.varname, input.value);
          label.style.fontSize = (input.value) ? '' : '75%';
        });
      });
      label.appendChild(input);
      label.appendChild(text);
      return label;
    }
    /****************************************************************
     * select/option タグを作成する
     * @param def タグ用定義
     * @param type タグタイプ
     * @returns エレメント
     */
    const make_select_elm = (def: DEF, type: string) => {
      const select = create_select_element();
      make_enter_event(select, def);
      select.addEventListener('change', e => {
        set_prop(def.varname, select.value);
      });
      select.name = def.varname;
      if (def.title) select.title = def.title;
      const selval = (vals?.hasOwnProperty(def.varname)) ? vals[def.varname] : '';
      def.option?.forEach(o => {
        const option = create_option_element();
        option.value = o;
        if (selval == o) option.selected = true;
        option.appendChild(create_text(o));
        select.appendChild(option);
      });
      return select;
    }
    /****************************************************************
     * input type=button/reset タグを作成する
     * @param def タグ用定義
     * @param type タグタイプ
     * @returns エレメント
     */
    const make_button_elm = (def: DEF, type: string) => {
      const button = create_input_element(type);
      //ラベル,color,bgColor,method,action,target
      if (def.option) {
        const [label, color, bgColor, method, action, target] = def.option;
        const style = button.style;
        if (label) button.value = label;
        if (color) style.color = color;
        if (bgColor) style.backgroundColor = bgColor;
        if (type == 'submit') {
          if (method) form.method = method;
          if (action) form.action = action;
          if (target) form.target = target;
        }
      }
      button.addEventListener('click', e => {
        if (type == 'reset') {
          setTimeout(() => {
            form.querySelectorAll('input,select,textarea').forEach(e => {
              e.dispatchEvent(new Event('change'));
            });
            this.button(e, vals, def.varname);
          });
        } else {
          this.button(e, vals, def.varname);
        }
      });
      return button;
    }
    /****************************************************************
     * テキスト表示時のサイズ(幅)を求める
     * @param txt テキスト
     * @returns サイズ(px)
     */
    const getsize = (txt: string) =>
      (calc_prex.innerText = txt, calc_prex.clientWidth);
    /****************************************************************
     * 各タグを作成する
     * @param matches テキスト分割正規表現
     * @param line 行位置
     */
    const create_elm = (matches: RegExpExecArray, line: number) => {
      const prev = matches.input.substring(0, matches.index);
      const hits = matches[1];
      const v = hits.charAt(1);
      const def = _defmap.get(v);
      if (!def) return;
      //-------------------------------------------------------------
      const type = def.type || 'text';
      const spec = ['checkbox', 'radio', 'file', 'select', 'reset', 'button', 'submit'];
      const fncs = [
        make_check_elm, make_check_elm, make_file_elm,
        make_select_elm, make_button_elm, make_button_elm, make_button_elm];
      const idx = spec.indexOf(type);
      const elm = (idx == -1) ? make_input_elm(def, type) : fncs[idx](def, type);
      Object.assign(elm.style, {
        top: `calc(${lineHeight} * ${line} + 8px)`,
        left: `calc(${getsize(prev)}px - 8px)`,  //padding分
        width: `calc(${getsize(hits)}px - 16px)`,//padding分
        height: `calc(${lineHeight} * ${def.line} - 1px)`,
      } as CSSStyleDeclaration);
      form.appendChild(elm);
    }
    //---------------------------------------------------------------
    // ..
    pre.innerText = viewtext;
    form.style.width = `${pre.clientWidth - 16}px`;
    form.style.height = `${pre.clientHeight - 16}px`;
    const scales = window.getComputedStyle(pre).transform.split(/[(,)]/);
    _thisElm.style.width = `calc(${pre.clientWidth + 10}px * ${(scales.length >= 5) ? scales[1] : 1})`;
    _thisElm.style.height = `calc(${pre.clientHeight + 10}px * ${(scales.length >= 5) ? scales[4] : 1})`;
    //---------------------------------------------------------------
    // ..
    const calc_prex = create_element('pre');
    _thisElm.appendChild(calc_prex);
    const re = /(\[[a-z][ \t　]*\])/g;
    viewtext.split(/\r\n|\n/).forEach((tx, line) => {
      let matches;
      while ((matches = re.exec(tx)) != null) {
        create_elm(matches, line);
      }
    });
    calc_prex.parentElement.removeChild(calc_prex);
    this._bkuptext = viewtext;
    if (form.querySelector('input[type=file]')) {
      form.enctype = 'multipart/form-data';
    }
    this._createBorderLines();
  }

  /**
   * StaticProviderのuseValue値の生成
   * @param vals val names object
   * @param text form text
   * @param texturl form text url
   * @param opts custom options
   * @param button button click event function
   * @param enter press enter key event function
   * @returns FORM画面用StaticProvider
   */
  public static provider(
    vals: any,
    text: string,
    texturl: string,
    opts?: TYM_FORM_OPTS,
    button?: (event: MouseEvent, vals: any, varname: string) => void,
    enter?: (event: KeyboardEvent, vals: any, varname: string) => void,
  ): StaticProvider {
    return {
      provide: TymFormComponent.TYM_FORM_TOKEN,
      useValue: {
        vals: vals,
        text: text,
        texturl: texturl,
        button: button,
        enter: enter,
        opts: opts,
      }
    }
  }
}