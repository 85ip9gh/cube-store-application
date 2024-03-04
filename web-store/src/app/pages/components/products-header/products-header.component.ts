import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-products-header',
  templateUrl: './products-header.component.html',
  styles: [
  ]
})
export class ProductsHeaderComponent {
  @Input() mobile: boolean = false;
  @Output() columnCountChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() itemCountChange = new EventEmitter<string>();
  
  sort = 'desc';
  itemCount: string = 'All';

  constructor() { }

  ngOnInit(): void {
  }

  onSortUpdated(newSort: string) :void {
    this.sort = newSort;
    this.sortChange.emit(newSort);
  }

  onItemCountUpdated(newCount: string): void {
      this.itemCount = newCount;
    this.itemCountChange.emit(newCount);
  }

  onColumnsUpdated(newCol: number): void {
    this.columnCountChange.emit(newCol);
  }
}
