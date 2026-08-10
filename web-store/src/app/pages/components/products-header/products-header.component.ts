import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-products-header',
  templateUrl: './products-header.component.html',
  styles: [
  ]
})
export class ProductsHeaderComponent implements OnInit, OnDestroy {
  @Input() mobile: boolean = false;
  @Input() resultCount: number = 0;
  @Output() columnCountChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() itemCountChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterToggle = new EventEmitter<void>();

  sort = 'desc';
  itemCount: string = 'All';
  searchTerm: string = '';
  columns: number = 3;

  private searchSubject = new Subject<string>();

  constructor() { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => this.searchChange.emit(term));
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchUpdated(term: string): void {
    this.searchSubject.next(term);
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
    this.columns = newCol;
    this.columnCountChange.emit(newCol);
  }
}
