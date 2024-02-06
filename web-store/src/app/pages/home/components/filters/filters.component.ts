import { Component, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
})
export class FiltersComponent {
  form: FormGroup;
  

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
    this.form = new FormGroup({
      minimumPrice: new FormControl('', [Validators.required, Validators.min(0), Validators.max(this.maximumPrice)]),
      maximumPrice: new FormControl('', [Validators.required, Validators.min(0)]),
    });
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
    if (this.minimumPrice < 0) {
      this.form.controls['minimumPrice'].setErrors({ 'min': true });
    } else if (this.minimumPrice > this.maximumPrice) {
      this.form.controls['minimumPrice'].setErrors({ 'max': true });
    } else {
      this.form.controls['minimumPrice'].setErrors(null);
    }

    console.log("minimum price: " + this.minimumPrice);
    this.minimumPriceChange.emit(this.minimumPrice);
  }

  onMaximumPriceUpdate(): void {
    if (this.maximumPrice < this.minimumPrice) {
      this.form.controls['maximumPrice'].setErrors({ 'min': true });
    } else {
      this.form.controls['maximumPrice'].setErrors(null);
    }
    console.log("maximum price: " + this.maximumPrice);
    this.maximumPriceChange.emit(this.maximumPrice);
}

  // onMinimumPriceUpdate(): void {
  //   if(this.minimumPrice === null || this.minimumPrice < 0){
  //     this.minimumPrice = 0;
  //   }
  //    this.minimumPriceChange.emit(this.minimumPrice);
  //   console.log(this.minimumPrice);  
  // }
 
  // onMaximumPriceUpdate(): void {
  //   if(this.minimumPrice > 100){
  //     this.maximumPrice = 100;
  //   }
  //   this.maximumPriceChange.emit(this.maximumPrice);
  //   console.log(this.maximumPrice);
  // }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }
}
