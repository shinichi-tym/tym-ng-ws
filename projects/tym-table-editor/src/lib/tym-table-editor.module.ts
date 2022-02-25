/*!
 * tym-table-editor.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { TymTableEditorComponent } from './tym-table-editor.component';
import { TymTableInputComponent } from "./tym-table-input.component";

@NgModule({
  declarations: [
    TymTableEditorComponent, TymTableInputComponent
  ],
  imports: [
  ],
  exports: [
    TymTableEditorComponent, TymTableInputComponent
  ]
})
export class TymTableEditorModule { }
