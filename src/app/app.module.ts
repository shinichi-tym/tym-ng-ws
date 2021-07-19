import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
// import { TymTableModule } from "projects/tym-table/src/lib/tym-table.module";
import { TymTableModule } from "dist/tym-table";
// import { TymTableModule } from "tym-table";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, TymTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
