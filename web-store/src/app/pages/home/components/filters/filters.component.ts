import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
})
export class FiltersComponent {

@Output() categoryChange = new EventEmitter<string>();

categories = ['Metal', 'Plastic', 'Wood', 'Glass', 'Paper', 'All']

constructor() {

 }

ngOnInit(): void {

}

onCategoryUpdate(newCategory: string): void {
  console.log(newCategory);
  this.categoryChange.emit(newCategory);
}

}
