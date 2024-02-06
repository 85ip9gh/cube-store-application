import { Component, Input } from '@angular/core';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  // declaring the cart variable and setting it to an empty array
  private _cart: Cart = { items: [] };
  itemsQuantity: number = 0;

  @Input()
  get cart(): Cart {
    return this._cart;
  }

  // setting the cart variable to the parameter passed in and getting the quantity of items in the cart by mapping through the items and adding the quantity of each item
  set cart(cart: Cart) {
    this._cart = cart;
    this.itemsQuantity = cart.items
    .map(item => item.quantity)
    .reduce((prev, curr) => prev + curr, 0);
  }

  // injecting the cart service into header component
  constructor(private cartService: CartService) {
  }

  // gets the total price of the items in the cart
  getTotal(items: CartItem[]): number {
    return this.cartService.getTotal(items);
  }

  // clears the cart
  onClearCart(): void {
    this.cartService.clearCart();
  }

}
