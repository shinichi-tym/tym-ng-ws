import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TymTableModule } from "tym-table";
import { TymDirectiveModule } from "tym-directive";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, TymTableModule, TymDirectiveModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
