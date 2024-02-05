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
  @Output() minimumPriceChange = new EventEmitter<number>();
  @Output() maximumPriceChange = new EventEmitter<number>();

  categoriesSubscription: Subscription | undefined;
  categories: string[] | undefined;
  sizes: string[] | undefined;
  minimumPrice: number = 0;
  maximumPrice: number = 100;


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

  onMinimumPriceUpdate(): void {
    this.minimumPriceChange.emit(this.minimumPrice);
    console.log(this.minimumPrice);  
  }
 
  onMaximumPriceUpdate(): void {
    this.maximumPriceChange.emit(this.maximumPrice);
    console.log(this.maximumPrice);
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }
}
