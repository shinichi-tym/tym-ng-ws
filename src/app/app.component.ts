import { Component, Output } from '@angular/core';
import { CUSTOM, DEFS } from 'projects/tym-table/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tym-ng-ws';
  @Output() custom: CUSTOM = {
    headerBoxShadow: "0px 1px 1px rgba(255,255,255,0.3) inset",
    headerBackground: "linear-gradient(#829ebc,#225588)"
  }
  @Output() defs: DEFS = {cols:[{title:"#"}]}
  @Output() data: any[][] = [["#"]];
  fnc1x1(): void {
    this.defs = {
      cols: [
        { title: "単価" }
      ]
    }
    this.data = [
      [980],
    ];
    console.log("fnc1x1");
  }
  fnc3x3(): void {
    this.defs = {
      cols: [
        { title: "単価" },
        { title: "販売数" },
        { title: "売上" }
      ]
    }
    this.data = [
      [980, 627, 614460],
      [1980, 1219, 2413620],
      [2980, 116, 345680]
    ];
    console.log("fnc3x3");
  }
  fnc10x20(): void {
    this.defs.cols = [];
    for (let index = 0; index < 10; index++) {
      this.defs.cols.push({ title: "HEADER-" + (index + 1) });
    }
    this.data = [];
    for (let index_r = 0; index_r < 20; index_r++) {
      let row = [];
      for (let index_c = 0; index_c < 10; index_c++) {
        row.push("DATA-" + (index_r + 1) + "-" + (index_c + 1))
      }
      this.data.push(row);
    }
    console.log("fnc10x20");
  }
  fnc20x20(): void {
    this.defs.cols = [];
    for (let index = 0; index < 20; index++) {
      this.defs.cols.push({ title: "HEADER-" + (index + 1) });
    }
    this.data = [];
    for (let index_r = 0; index_r < 20; index_r++) {
      let row = [];
      for (let index_c = 0; index_c < 20; index_c++) {
        row.push("DATA-" + (index_r + 1) + "-" + (index_c + 1))
      }
      this.data.push(row);
    }
    console.log("fnc20x20");
  }
  fnc100x20(): void {
    this.defs.cols = [];
    for (let index = 0; index < 20; index++) {
      this.defs.cols.push({ title: "HEADER-" + (index + 1) });
    }
    this.data = [];
    for (let index_r = 0; index_r < 100; index_r++) {
      let row = [];
      for (let index_c = 0; index_c < 20; index_c++) {
        row.push("DATA-" + (index_r + 1) + "-" + (index_c + 1))
      }
      this.data.push(row);
    }
    console.log("fnc100x20");
  }
}
