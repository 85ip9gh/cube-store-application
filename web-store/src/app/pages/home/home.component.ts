import { Component } from '@angular/core';

const ROWS_HEIGHT: { [id: number]: number } = {1:400, 3:335, 4:350}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  cols: number = 3;
  rowHeight = ROWS_HEIGHT[this.cols];
  category: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  onColumnCountChange(newCols: number): void {
    this.cols = newCols;
    this.rowHeight = ROWS_HEIGHT[this.cols];
  }

  onCategoryChange(newCategory: string): void {
    this.category = newCategory;
  }

}
