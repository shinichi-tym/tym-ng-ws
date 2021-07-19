import { Component, Output } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tym-ng-ws';
  @Output() rows: number = 10;
  @Output() cols: number = 10;
  fnc1x1(): void {
    this.cols = 1;
    this.rows = 1;
    console.log("fnc1x1");
  }
  fnc10x20(): void {
    this.cols = 10;
    this.rows = 20;
    console.log("fnc10x20");
  }
  fnc20x20(): void {
    this.cols = 20;
    this.rows = 20;
    console.log("fnc20x20");
  }
  fnc100x20(): void {
    this.cols = 100;
    this.rows = 20;
    console.log("fnc1x1");
  }
}
