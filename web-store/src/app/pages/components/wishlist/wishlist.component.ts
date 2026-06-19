import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit, OnDestroy {

  products: Product[] = [];
  private wishlistSubscription: Subscription | undefined;

  constructor(private wishlistService: WishlistService, private cartService: CartService) {}

  ngOnInit(): void {
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(products => {
      this.products = products;
    });
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
    this.wishlistSubscription?.unsubscribe();
  }
}
