import { Component, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
})
export class FiltersComponent {

  @Output() categoryChange = new EventEmitter<string>();
  @Output() sizeChange = new EventEmitter<string>();

  categoriesSubscription: Subscription | undefined;
  categories: string[] | undefined;
  prices: number[] = [100, 200, 300, 400, 500];
  ages: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  sizes: string[] | undefined;
  minimumPrice: number | undefined;
  maximumPrice: number | undefined;

  constructor(private storeService: StoreService) {

  }

  ngOnInit(): void {
    this.storeService.getAllCategories()
      .subscribe((categories: string[]) => {
        this.categories = categories;
      });
    this.storeService.getAllSizes()
      .subscribe((sizes: string[]) => {
        this.sizes = sizes;
      });
  }

  onCategoryUpdate(newCategory: string): void {
    this.categoryChange.emit(newCategory);
  }

  onSizeUpdate(newSize: string): void {
   this.sizeChange.emit(newSize);
   
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }
}
