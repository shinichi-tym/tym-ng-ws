/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TymTableComponent } from './tym-table.component';
import { ResizeDirective } from './tym-resize.directive';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    TymTableComponent,
    ResizeDirective
  ],
  imports: [
    CommonModule, BrowserModule, FormsModule
  ],
  exports: [
    TymTableComponent
  ]
})

export class TymTableModule { }
