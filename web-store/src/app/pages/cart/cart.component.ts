import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';

// for AWS EC2 instance
const STORE_BASE_URL = 'http://18.118.238.40:4242';

//for local development
//const STORE_BASE_URL = 'http://localhost:4242';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styles: [
  ]
})
export class CartComponent {
  
  cart: Cart = {items: []}

  dataSource: CartItem[] = [];
  displayedColumns: string[] = ['product', 'name', 'quantity', 'price', 'total', 'action'];

    constructor(private cartService: CartService, private http: HttpClient) { }

    ngOnInit(): void {
      this.dataSource = this.cart.items;
      this.cartService.cart.subscribe((_cart: Cart) => {
        this.cart = _cart;
        this.dataSource = _cart.items;
      });
    }

    getTotal(items: CartItem[]): number {
      return this.cartService.getTotal(items);
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

    onCheckout(): void {
      this.http.post( `${STORE_BASE_URL}/checkout`, {
        items: this.cart.items
      }).subscribe(async(res: any) => {
        let stripe = await loadStripe('pk_test_51OTZqzA7JcW8doruYawTDrUzXPGQ8mQaqf0i7QwmhveJskGH6U991v0MwWHBBor2xUiagg86owYKlnDwwp6QZ5tx009eEEEJyK');
        stripe?.redirectToCheckout({ sessionId: res.id });
      });
    }
}
