import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TymTableModule } from "tym-table";
import { TymDirectiveModule } from "tym-directive";
import { TymModalModule } from "tym-modals";
import { TymTreeModule } from "tym-tree";
import { TymTableEditorModule } from "tym-table-editor";
import { TymFormModule } from "tym-form";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, FormsModule,
    TymTableModule, TymDirectiveModule, TymModalModule, TymTreeModule,
    TymTableEditorModule, TymFormModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
