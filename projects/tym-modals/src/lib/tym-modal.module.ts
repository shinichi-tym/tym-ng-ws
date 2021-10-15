/*!
 * tym-modals.js
 * Copyright (c) 2021 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TymModalComponent } from './tym-modal.component';
import { TymDialogComponent } from './tym-dialog.component';

@NgModule({
  declarations: [
    TymModalComponent,
    TymDialogComponent
  ],
  imports: [
    BrowserModule
  ],
  exports: [
    TymModalComponent,
    TymDialogComponent
  ]
})
export class TymModalModule { }
