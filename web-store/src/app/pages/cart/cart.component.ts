import { Component } from '@angular/core';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styles: [
  ]
})
export class CartComponent {
  
  cart: Cart = {items: [
    {product: "https://via.placeholder.com/150",
    name: "Platinum Monolith",
    price: 150,
    quantity: 1,
    id: 1
  },
  {product: "https://via.placeholder.com/150",
    name: "Iridium Leviathan",
    price: 120,
    quantity: 2,
    id: 2
  }
  ]}

  dataSource: CartItem[] = [];
  displayedColumns: string[] = ['product', 'name', 'quantity', 'price', 'total', 'action'];

    constructor(private cartService: CartService) { }

    ngOnInit(): void {
      this.dataSource = this.cart.items;
    }

    getTotal(items: CartItem[]): number {
      return this.cartService.getTotal(items);
    }
}
