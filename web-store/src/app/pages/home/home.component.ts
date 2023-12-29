import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  cols: number = 3;
  category: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  onColumnCountChange(newCols: number): void {
    this.cols = newCols;
  }

  onCategoryChange(newCategory: string): void {
    this.category = newCategory;
  }

}
