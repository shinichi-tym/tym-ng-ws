/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { TymTableComponent } from './tym-table.component';
import { ResizeDirective } from './tym-resize.directive';
import { OrdermkDirective } from './tym-ordermk.directive';
import { DragDropDirective } from './tym-dragdrop.directive';
import { CellmkDirective } from "./tym-cellmk.directive";

@NgModule({
  declarations: [
    TymTableComponent,
    ResizeDirective,
    OrdermkDirective,
    DragDropDirective,
    CellmkDirective
  ],
  imports: [
    CommonModule, BrowserModule, FormsModule
  ],
  exports: [
    TymTableComponent
  ]
})

export class TymTableModule { }
