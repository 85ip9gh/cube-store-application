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

  cols: number = 3;
  rowHeight = ROWS_HEIGHT[this.cols];
  category: string | undefined;
  products: Product[] | undefined;
  sort: string = 'desc';
  count = '12';
  productSubscription: Subscription | undefined;

  constructor(private cartService: CartService, private storeService: StoreService) {

   }

  ngOnInit(): void {
    this.getProducts();
    this.products?.sort((a, b) => b.title.localeCompare(a.title));
  }

  getProducts(): void {
    this.productSubscription = this.storeService.getAllProducts().subscribe((products: Product[]) => {
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
    this.products = this.products?.filter((product: Product) => product.category === newCategory);
  }

  onItemCountChange(newCount: number): void {
    this.count = newCount.toString();
    this.getProducts();
    this.products = this.products?.slice(0, newCount);
  }

  onSortChange(newSort: string): void {
    this.sort = newSort;
    if(this.sort == 'desc'){
      this.products?.sort((a, b) => b.title.localeCompare(a.title));
    }else{
      this.products?.sort((a, b) => a.title.localeCompare(b.title));
    }
    // this.getProducts();
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart({
      product: product.image,
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
