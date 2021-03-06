/*!
 * tym-directive.js
 * Copyright (c) 2021, 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { TymCommDirective } from './tym-comm.directive';
import { TymResizeDirective } from './tym-resize.directive';
import { TymTableEditDirective } from "./tym-table-edit.directive";
import { TymTableViewComponent } from './tym-table-view.component';
import { TymSplitterDirective } from './tym-splitter.directive';
import { TymTreeViewComponent } from "./tym-tree-view.component";

@NgModule({
  declarations: [
    TymCommDirective,
    TymResizeDirective,
    TymTableEditDirective,
    TymTableViewComponent,
    TymSplitterDirective,
    TymTreeViewComponent
  ],
  imports: [
    CommonModule,
    BrowserModule
  ],
  exports: [
    TymCommDirective,
    TymResizeDirective,
    TymTableEditDirective,
    TymTableViewComponent,
    TymSplitterDirective,
    TymTreeViewComponent
  ]
})
export class TymDirectiveModule { }
