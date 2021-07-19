/*!
 * tym-table.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { TymTableComponent } from './tym-table.component';

import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    TymTableComponent
  ],
  imports: [
    CommonModule, BrowserModule
  ],
  exports: [
    TymTableComponent
  ]
})

export class TymTableModule { }
