import { Component, getPlatform } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { StoreService } from '../../services/store.service';

const ROWS_HEIGHT: { [id: number]: number } = {1:400, 3:335, 4:350}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  cols: number = 1;
  rowHeight = ROWS_HEIGHT[this.cols];
  category: string | undefined;
  size: string = 'All';
  products: Product[] | undefined;
  sort: string | undefined;
  count = 'All';
  productSubscription: Subscription | undefined;

  constructor(private cartService: CartService, private storeService: StoreService) {

   }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.productSubscription = this.storeService.getAllProducts(this.count, this.sort ,this.category, this.size).subscribe((products: Product[]) => {
      this.products = products;
    });

  }

  onColumnCountChange(newCols: number): void {
    this.cols = newCols;
    this.rowHeight = ROWS_HEIGHT[this.cols];
  }

  onCategoryChange(newCategory: string): void {
    this.category = newCategory;
    this.getProducts();
  }

  onSizeChange(newSize: string): void {
    this.size = newSize;
    this.getProducts();
  }

  onItemCountChange(newCount: string): void {
    this.count = newCount;
    this.getProducts();
  }

  onSortChange(newSort: string): void {
    this.sort = newSort;
    this.getProducts();
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart({
      product: product.imagePath,
      id: product.id,
      name: product.title,
      price: product.price,
      quantity: 1
    });
  }

  ngOnDestroy(): void {
    this.productSubscription?.unsubscribe();
  }

}
