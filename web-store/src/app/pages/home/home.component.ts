import { Component, EventEmitter, HostListener, Output, ViewChild  } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { StoreService } from '../../services/store.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from 'src/app/services/drawer.service';

const ROWS_HEIGHT: { [id: number]: number } = {1:500, 3:335, 4:350}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  cols: number = 1;
  rowHeight = ROWS_HEIGHT[this.cols];
  category: string | undefined;
  size: string = 'All';
  products: Product[] | undefined;
  sort: string | undefined;
  count = 'All';
  productSubscription: Subscription | undefined;
  min: number = 0;
  max:number = 100;
  mobile: boolean = false;
  mode: string = 'side';
  opened: boolean = true;

  @ViewChild('drawer') drawer!: MatDrawer;
  private unsubscribe$ = new Subject();

  drawerMode: 'side' | 'over' = 'side'; // Default mode
  isDrawerOpen = true; // Default opened state
  private drawerSubscription: Subscription | undefined;

  constructor(private cartService: CartService, private storeService: StoreService, private drawerService: DrawerService, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(
        takeUntil(this.unsubscribe$),
        map(result => result.matches)
      )
      .subscribe(isHandset => {
        if (isHandset) {
          this.drawerMode = 'over'; // Change mode to 'over' on mobile
          this.isDrawerOpen = false; // Close drawer on mobile
          this.toggleMobile(true);
        } else {
          this.drawerMode = 'side'; // Change mode to 'side' on larger screens
          this.isDrawerOpen = true; // Open drawer on larger screens
          this.toggleMobile(false);
        }
      });
   }

  ngOnInit(): void {
    this.getProducts();
    this.drawerService.toggleMobile(this.mobile);
    this.drawerSubscription = this.drawerService.drawerState$.subscribe(isOpen => {
      this.isDrawerOpen = isOpen; // Update isDrawerOpen based on drawer state
    });
  }

  toggleDrawer(): void {
    this.drawerService.toggleDrawer(!this.isDrawerOpen); // Invert the current state and toggle drawer
  }

  toggleMobile(handSet: boolean): void {
    this.mobile = handSet;
    this.drawerService.toggleMobile(handSet);
  }

  getProducts(): void {
    this.productSubscription = this.storeService.getAllProducts(this.count, this.sort ,this.category, this.size, this.min, this.max).subscribe((products: Product[]) => {
      this.products = products;
      // console.log(products);
    });

  }

  onColumnCountChange(newCols: number): void {
    this.cols = newCols;
    this.rowHeight = ROWS_HEIGHT[this.cols];
  }

  onCategoryChange(newCategory: string): void {
    this.category = newCategory;
    this.getProducts();
  }

  onSizeChange(newSize: string): void {
    this.size = newSize;
    this.getProducts();
  }

  onItemCountChange(newCount: string): void {
    this.count = newCount;
    this.getProducts();
  }

  onMinPriceChange(newMin: number): void {
    this.min = newMin;
    this.getProducts();
  }

  onMaxPriceChange(newMax: number): void {
    this.max = newMax;
    this.getProducts();
  }

  onSortChange(newSort: string): void {
    this.sort = newSort;
    this.getProducts();
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart({
      product: product.imagePath,
      id: product.id,
      name: product.title,
      price: product.price,
      quantity: 1
    });
  }

  ngOnDestroy(): void {
    this.productSubscription?.unsubscribe();
    this.drawerSubscription?.unsubscribe();
    this.unsubscribe$.complete();
  }

}
