import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { Subscription } from 'rxjs';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';
import { DrawerService } from 'src/app/services/drawer.service';

const STORE_BASE_URL = window.__env.apiUrl;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styles: [
  ]
})
export class CartComponent {
  
  cart: Cart = {items: []}
  mobile: boolean = false;
  checkoutEnabled = window.__env.checkoutEnabled === true || window.__env.checkoutEnabled === 'true';
  checkoutError = '';

  private mobileStateSubscription: Subscription;
  private cartSubscription: Subscription;

  dataSource: CartItem[] = [];
  displayedColumns: string[] = ['product', 'name', 'quantity', 'price', 'total', 'action'];

    constructor(private cartService: CartService, private drawerService: DrawerService, private http: HttpClient) { 
      this.mobileStateSubscription = new Subscription();
      this.cartSubscription = new Subscription();
    }

    ngOnInit(): void {
      this.dataSource = this.cart.items;
      this.drawerService.toggleCart(true);
      this.cartSubscription = this.cartService.cart.subscribe((_cart: Cart) => {
        this.cart = _cart;
        this.dataSource = _cart.items;
      });
      this.mobileStateSubscription = this.drawerService.mobileState$.subscribe(mobile => {
        this.mobile = mobile;
        if (this.mobile) {
          this.displayedColumns = ['product', 'quantity', 'total'];
        } else {
          this.displayedColumns = ['product', 'name', 'quantity', 'price', 'total', 'action'];
        }
      });
      
    }

    getTotal(items: CartItem[]): number {
      return this.cartService.getTotal(items);
    }

    get itemQuantity(): number {
      return this.cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    onClearCart(): void {
      this.cartService.clearCart();
    }

    onRemoveItem(item: CartItem): void {
      this.cartService.removeItem(item);
    }

    onAddQuantity(item: CartItem): void {
      this.cartService.addToCart(item);
    }

    onSubtractQuantity(item: CartItem): void {
      this.cartService.subtractQuantity(item);
    }

    updateCartPage(): void {
      this.drawerService.toggleCart(false);
    }

    onCheckout(): void {
      if (!this.checkoutEnabled) {
        return;
      }
      this.checkoutError = '';
      this.http.post( `${STORE_BASE_URL}/checkout`, {
        items: this.cart.items
      }).subscribe(async(res: any) => {
        let stripe = await loadStripe('pk_test_51OTZqzA7JcW8doruYawTDrUzXPGQ8mQaqf0i7QwmhveJskGH6U991v0MwWHBBor2xUiagg86owYKlnDwwp6QZ5tx009eEEEJyK');
        const result = await stripe?.redirectToCheckout({ sessionId: res.id });
        if (result?.error) {
          this.checkoutError = result.error.message || 'Checkout could not start.';
        }
      }, () => {
        this.checkoutError = 'Checkout could not start. Please try again.';
      });
    }

    onCartImageError(event: Event): void {
      const image = event.target as HTMLImageElement;
      if (image.dataset['fallbackApplied']) {
        return;
      }
      image.dataset['fallbackApplied'] = 'true';
      image.src = 'assets/cube.png';
    }

    ngOnDestroy(): void {
      this.drawerService.toggleCart(false);
      this.mobileStateSubscription.unsubscribe();
      this.cartSubscription.unsubscribe();
    }
}
