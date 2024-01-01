import { Component, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
})
export class FiltersComponent {

  @Output() categoryChange = new EventEmitter<string>();

  categoriesSubscription: Subscription | undefined;
  categories: string[] | undefined;

  constructor(private storeService: StoreService) {

  }

  ngOnInit(): void {
    this.storeService.getAllCategories()
      .subscribe((categories: string[]) => {
        this.categories = categories;
      });
  }

  onCategoryUpdate(newCategory: string): void {
    console.log(newCategory);
    this.categoryChange.emit(newCategory);
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }
}
