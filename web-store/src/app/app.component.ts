import { Component, OnInit, ViewChild } from '@angular/core';
import { Cart } from './models/cart.model';
import { CartService } from './services/cart.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  template: `
    <app-header [cart]="cart"></app-header>
    <div class="min-h-[85vh]">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styles: []
})
export class AppComponent implements OnInit{
  cart: Cart = { items: [] };

  mobile: boolean = false;
  @ViewChild('drawer') drawer!: MatDrawer;

  onToggleDrawer(): void {
    this.drawer.toggle();
  }

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart.subscribe((_cart) => {
      this.cart = _cart;
    });
  }
}
