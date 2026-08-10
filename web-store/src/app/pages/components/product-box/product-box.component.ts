import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { WishlistService } from 'src/app/services/wishlist.service';
import { getProductFallbackImage } from 'src/app/utils/product-image';

@Component({
  selector: 'app-product-box',
  templateUrl: './product-box.component.html',
  styles: [
  ]
})
export class ProductBoxComponent implements OnInit, OnDestroy {
  @Input() fullWidthMode:boolean = false;

  @Input() product: Product | undefined;

  @Input() mobile: boolean = false;

  @Output() addToCart = new EventEmitter();

  isFavorited: boolean = false;
  imageFailed = false;
  imageSrc = '';
  private fallbackAttempted = false;
  private wishlistSubscription: Subscription | undefined;

  constructor(private router: Router, private wishlistService: WishlistService) {}

  ngOnInit(): void {
    this.imageSrc = this.product?.imagePath || '';
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      this.isFavorited = !!this.product && this.wishlistService.isInWishlist(this.product);
    });
  }

  ngOnDestroy(): void {
    this.wishlistSubscription?.unsubscribe();
  }

  onAddToCart(event: Event):void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    if (this.product) {
      this.wishlistService.toggle(this.product);
    }
  }

  onViewProduct(): void {
    if (this.product?._id) {
      this.router.navigate(['/home/cube', this.product._id]);
    }
  }

  onViewKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onViewProduct();
    }
  }

  onImageError(): void {
    if (this.product && !this.fallbackAttempted) {
      this.fallbackAttempted = true;
      this.imageSrc = getProductFallbackImage(this.product);
      return;
    }
    this.imageFailed = true;
  }

  // getImageSource(): string {
  //   return `data:image/png;base64,${this.product?.base64Image}`;
  // }
}
