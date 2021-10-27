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
import { TymMenuComponent } from "./tym-menu.component";

@NgModule({
  declarations: [
    TymModalComponent,
    TymDialogComponent,
    TymMenuComponent
  ],
  imports: [
    BrowserModule
  ],
  exports: [
    TymModalComponent,
    TymDialogComponent,
    TymMenuComponent
  ]
})
export class TymModalModule { }
