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

@NgModule({
  declarations: [
    TymResizeDirective
  ],
  imports: [
    CommonModule, BrowserModule
  ],
  exports: [
    TymResizeDirective
  ]
})
export class TymDirectiveModule { }
