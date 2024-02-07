import { Component, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  
  minimumPrice = new FormControl(null, [Validators.required, Validators.min(0), Validators.max(100)]);
  maximumPrice = new FormControl(null, [Validators.required, Validators.min(0), Validators.max(100)]);
  
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

  getMinimumPriceErrorMessage() {
    if (this.minimumPrice.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.minimumPrice.hasError('min')) {
      return 'Value must be greater than 0';
    }
    if (this.minimumPrice.hasError('max')) {
      return 'Value must be less than 100';
    }
    return '';
  }

  getMaximumPriceErrorMessage() {
    if (this.maximumPrice.hasError('required')) {
      return 'You must enter a value';
    }
    if (this.maximumPrice.hasError('min')) {
      return 'Value must be greater than 0';
    }
    if (this.maximumPrice.hasError('max')) {
      return 'Value must be less than 100';
    }
    return '';
  }

  onCategoryUpdate(newCategory: string): void {
    this.categoryChange.emit(newCategory);
  }

  onSizeUpdate(newSize: string): void {
   this.sizeChange.emit(newSize);
   
  }

  onMinimumPriceUpdate(): void {

    console.log("minimum price: " + this.minimumPrice);

    const minimumPriceValue: number = this.minimumPrice.value !== null ? this.minimumPrice.value : 0;
    this.minimumPriceChange.emit(minimumPriceValue);
  }

  onMaximumPriceUpdate(): void {

    console.log("maximum price: " + this.maximumPrice);
    const maximumPriceValue: number = this.maximumPrice.value !== null ? this.maximumPrice.value : 0;
     this.maximumPriceChange.emit(maximumPriceValue);
}
  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }
}
