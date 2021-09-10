/*!
 * tym-directive.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { TymResizeDirective } from './tym-resize.directive';
import { TymTableViewComponent } from './tym-table-view.component';
import { TymSplitterDirective } from './tym-splitter.directive';

@NgModule({
  declarations: [
    TymResizeDirective,
    TymTableViewComponent,
    TymSplitterDirective
  ],
  imports: [
    CommonModule, BrowserModule
  ],
  exports: [
    TymResizeDirective, TymTableViewComponent, TymSplitterDirective
  ]
})
export class TymDirectiveModule { }
