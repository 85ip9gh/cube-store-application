import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {
  // private drawerState = new Subject<boolean>();
  // private mobileState = new Subject<boolean>();
  // private cartState = new Subject<boolean>();

  private drawerState = new BehaviorSubject<boolean>(false);
  private mobileState = new BehaviorSubject<boolean>(false);
  private cartState = new BehaviorSubject<boolean>(false);

  drawerState$ = this.drawerState.asObservable();
  mobileState$ = this.mobileState.asObservable();
  cartState$ = this.cartState.asObservable();

  toggleDrawer(drawer: boolean): void {
    this.drawerState.next(drawer);
    console.log("drawer service toggleDrawer " + drawer);
  }

  toggleCart(cart: boolean): void {
    this.cartState.next(cart);
    console.log("drawer service toggleCart " + cart);
  }

  toggleMobile(mobile: boolean): void {
    this.mobileState.next(mobile);
    console.log("drawer service toggleMobile " + mobile);
  }
}