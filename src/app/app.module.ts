import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TymTableModule } from "tym-table";
import { TymDirectiveModule } from "tym-directive";
import { TymModalModule } from "tym-modals";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, FormsModule,
    TymTableModule, TymDirectiveModule, TymModalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
