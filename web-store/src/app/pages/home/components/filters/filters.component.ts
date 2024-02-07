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
  
  //injects the store service via the constructor
  constructor(private storeService: StoreService) {
  }

  //gets all the categories and sizes from the store service through subscriptions
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

  //gets the error message for the minimum price input
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

  //gets the error message for the maximum price input
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

  //gets called when the category select changes and emits the new value
  onCategoryUpdate(newCategory: string): void {
    this.categoryChange.emit(newCategory);
  }

  //gets called when the size select changes and emits the new value
  onSizeUpdate(newSize: string): void {
   this.sizeChange.emit(newSize);
   
  }
  //gets called when the minimum price input changes and emits the new value
  onMinimumPriceUpdate(): void {
    //if the value is null, set it to 0. If it's less than 0, set it to 0. If it's greater than 100, set it to 100
    let minimumPriceValue: number = this.minimumPrice.value !== null 
    ? (this.minimumPrice.value < 0)
        ? 0
        : (this.minimumPrice.value > 100)
        ? 100
        :this.minimumPrice.value
      :0;
    
    this.minimumPriceChange.emit(minimumPriceValue);
  }

  //gets called when the maximum price input changes and emits the new value
  onMaximumPriceUpdate(): void {
    //if the value is null, set it to 0. If it's less than 0, set it to 100. If it's greater than 100, set it to 100
    const maximumPriceValue: number = this.maximumPrice.value !== null 
      ? (this.maximumPrice.value < 0)
        ? 100
        : (this.maximumPrice.value > 100)
        ? 100
        :this.maximumPrice.value
      : 0;

    this.maximumPriceChange.emit(maximumPriceValue); 
}

 //unsubscribes from the categoriesSubscription if the subscription exists when the component is destroyed(i.e. when the component is destroyed or the user navigates to another page)
  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }
}
