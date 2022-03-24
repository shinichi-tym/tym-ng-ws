/*!
 * tym-form.js
 * Copyright (c) 2022 shinichi tayama
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 */

import { NgModule } from '@angular/core';
import { TymFormComponent } from './tym-form.component';

@NgModule({
  declarations: [
    TymFormComponent
  ],
  imports: [
  ],
  exports: [
    TymFormComponent
  ],
  providers: [{ provide: TymFormComponent.TYM_FORM_TOKEN, useValue: {} }]
})
export class TymFormModule { }
