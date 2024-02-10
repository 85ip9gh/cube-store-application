import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from '../../services/cart.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  // declaring the cart variable and setting it to an empty array
  private _cart: Cart = { items: [] };
  itemsQuantity: number = 0;

  // declaring and initializing the mobile variable to false by default
  mobile: boolean = false;
  toggle: boolean = false;

  @Input()
  get cart(): Cart {
    return this._cart;
  }

  // setting the Output toggleDrawer variable to an event emitter
  @Output() toggleDrawer = new EventEmitter<void>();

  private mobileStateSubscription: Subscription;

   // injecting the cart and drawer service into header component
   constructor(private cartService: CartService, private drawerService: DrawerService) {
    this.mobileStateSubscription = new Subscription();
  }

  ngOnInit(): void {
    // Subscribe to the mobileState$ observable to receive updates
    this.mobileStateSubscription = this.drawerService.mobileState$.subscribe(mobile => {
      this.mobile = mobile;
    });
  }

  // emitting the toggleDrawer event when the function is called
  onToggleDrawer(): void {
    this.toggle = !this.toggle;
    this.drawerService.toggleDrawer(this.toggle); // toggle the drawer
    console.log("header Component toggleDrawer " + this.toggle);
  }

  // setting the cart variable to the parameter passed in and getting the quantity of items in the cart by mapping through the items and adding the quantity of each item
  set cart(cart: Cart) {
    this._cart = cart;
    this.itemsQuantity = cart.items
    .map(item => item.quantity)
    .reduce((prev, curr) => prev + curr, 0);
  }

  // gets the total price of the items in the cart
  getTotal(items: CartItem[]): number {
    return this.cartService.getTotal(items);
  }

  // clears the cart
  onClearCart(): void {
    this.cartService.clearCart();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the subscription to prevent memory leaks
    this.mobileStateSubscription.unsubscribe();
  }

}
