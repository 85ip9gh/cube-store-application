import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart = new BehaviorSubject<Cart>({ items: []});
 
  constructor(private _snackBar: MatSnackBar) { }

  addToCart(product: CartItem) {
    const items = [...this.cart.value.items];

    const itemInCart = items.find(item => item.id === product.id);
    if (itemInCart) {
      itemInCart.quantity += 1;
    } else {
      items.push(product);
    }

    this.cart.next({ items });
    this._snackBar.open('Product added to cart', 'Close', {
      duration: 3000,
    });
  }

  getTotal(items: CartItem[]): number {
    return items
      .map(item => item.quantity * item.price)
      .reduce((prev, curr) => prev + curr, 0);
  }

  clearCart(): void {
    this.cart.next({ items: [] });
    this._snackBar.open('all items removed', 'Close', {
      duration: 3000,
    });
  }

  removeItem(item: CartItem): void {
    const items = [...this.cart.value.items];
    const index = items.findIndex(_item => _item.id === item.id);
    items.splice(index, 1);
    this.cart.next({ items });
    this._snackBar.open('item removed', 'Close', {
      duration: 3000,
    });
  }
}
