import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, Subscription, map, takeUntil } from 'rxjs';
import { Product } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { DrawerService } from 'src/app/services/drawer.service';
import { StoreService } from 'src/app/services/store.service';

const ROWS_HEIGHT: { [id: number]: number } = {1:500, 3:335, 4:350}

@Component({
  selector: 'app-admin',
  templateUrl:'./admin.component.html',
})
export class AdminComponent {
  
}
