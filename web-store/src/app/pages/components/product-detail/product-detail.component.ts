import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy {

  product: Product | undefined;
  notFound: boolean = false;

  private routeSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.storeService.getProductById(id).subscribe({
      next: (product) => this.product = product,
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

  onBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}
