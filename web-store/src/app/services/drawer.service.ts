import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {
  private drawerState = new Subject<boolean>();
  private mobileState = new Subject<boolean>();

  drawerState$ = this.drawerState.asObservable();
  mobileState$ = this.mobileState.asObservable();

  toggleDrawer(drawer: boolean): void {
    this.drawerState.next(drawer);
    console.log("drawer service toggleDrawer " + drawer);
  }

  toggleMobile(mobile: boolean): void {
    this.mobileState.next(mobile);
  }
}