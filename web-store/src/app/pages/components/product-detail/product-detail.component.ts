import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { StoreService } from 'src/app/services/store.service';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy {

  product: Product | undefined;
  notFound: boolean = false;
  isFavorited: boolean = false;

  private routeSubscription: Subscription | undefined;
  private wishlistSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      this.isFavorited = !!this.product && this.wishlistService.isInWishlist(this.product);
    });
  }

  loadProduct(id: string): void {
    this.storeService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isFavorited = this.wishlistService.isInWishlist(product);
      },
      error: () => this.notFound = true
    });
  }

  onAddToCart(): void {
    if (!this.product) {
      return;
    }
    this.cartService.addToCart({
      product: this.product.imagePath,
      id: this.product.id,
      name: this.product.title,
      price: this.product.price,
      quantity: 1
    });
  }

  onToggleWishlist(): void {
    if (this.product) {
      this.wishlistService.toggle(this.product);
    }
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
  }
}
