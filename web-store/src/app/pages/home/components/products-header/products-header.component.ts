import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-products-header',
  templateUrl: './products-header.component.html',
  styles: [
  ]
})
export class ProductsHeaderComponent {
  @Output() columnCountChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() itemCountChange = new EventEmitter<number>();
  sort = 'desc';
  itemCount = 12;

  constructor() { }

  ngOnInit(): void {
  }

  onSortUpdated(newSort: string) :void {
    this.sort = newSort;
    this.sortChange.emit(newSort);
  }

  onItemCountUpdated(newCount: number): void {
    this.itemCount = newCount;
    this.itemCountChange.emit(newCount);
  }

  onColumnsUpdated(newCol: number): void {
    this.columnCountChange.emit(newCol);
  }
}
