import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { CartService } from '../../../../services/cart.service';
import { Subscription } from 'rxjs';
import { StoreService } from '../../../../services/store.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from 'src/app/services/drawer.service';
import { getProductFallbackImage } from 'src/app/utils/product-image';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  cols: number = 3;
  category: string = '';
  size: string = 'All';
  products: Product[] | undefined;
  sort: string = 'desc';
  count = 'All';
  productSubscription: Subscription | undefined;
  min: number = 0;
  max:number = 150;
  search: string = '';
  mobile: boolean = false;
  mode: string = 'side';
  opened: boolean = true;
  isLoading = true;
  loadError = false;
  collectionSize = 0;
  featuredProducts: Product[] = [];
  readonly skeletonItems = Array.from({ length: 6 });

  @ViewChild('drawer') drawer!: MatDrawer;
  private unsubscribe$ = new Subject<void>();

  drawerMode: 'side' | 'over' = 'side'; // Default mode
  isDrawerOpen = true; // Default opened state
  private drawerSubscription: Subscription | undefined;

  constructor(private cartService: CartService, private storeService: StoreService, private drawerService: DrawerService, private breakpointObserver: BreakpointObserver, private router: Router) {
    this.breakpointObserver.observe(['(max-width: 767px)'])
      .pipe(
        takeUntil(this.unsubscribe$),
        map(result => result.matches)
      )
      .subscribe(isHandset => {
        if (isHandset) {
          this.drawerMode = 'over';
          this.isDrawerOpen = false;
          this.toggleMobile(true);
        } else {
          this.drawerMode = 'side';
          this.isDrawerOpen = true;
          this.toggleMobile(false);
        }
      });
   }

  ngOnInit(): void {
    this.getProducts();
    this.drawerService.toggleMobile(this.mobile);
    this.drawerSubscription = this.drawerService.drawerState$.subscribe(isOpen => {
      this.isDrawerOpen = this.mobile ? isOpen : true;
    });

    const isHandset = this.breakpointObserver.isMatched('(max-width: 767px)');
    if (isHandset) {
      this.drawerMode = 'over';
      this.isDrawerOpen = false;
      this.mobile = true;
      this.drawerService.toggleMobile(true);
    } else {
      this.drawerMode = 'side';
      this.isDrawerOpen = true;
      this.mobile = false;
      this.drawerService.toggleMobile(false);
    }
  }

  toggleDrawer(): void {
    this.drawerService.toggleDrawer(!this.isDrawerOpen); // Invert the current state and toggle drawer
  }

  toggleMobile(handSet: boolean): void {
    this.mobile = handSet;
    this.drawerService.toggleMobile(handSet);
  }

  getProducts(): void {
    this.productSubscription?.unsubscribe();
    this.isLoading = true;
    this.loadError = false;
    this.productSubscription = this.storeService.getAllProducts(this.count, this.sort ,this.category, this.size, this.min, this.max, this.search).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        if (!this.featuredProducts.length && products.length) {
          this.featuredProducts = products.slice(0, 3);
          this.collectionSize = products.length;
        }
        this.isLoading = false;
      },
      error: () => {
        this.products = [];
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  retryProducts(): void {
    this.getProducts();
  }

  scrollToCollection(): void {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onViewFeatured(product: Product): void {
    if (product._id) {
      this.router.navigate(['/home/cube', product._id]);
    }
  }

  onHeroImageError(event: Event, product: Product): void {
    const image = event.target as HTMLImageElement;
    if (image.dataset['fallbackApplied']) {
      image.style.display = 'none';
      return;
    }
    image.dataset['fallbackApplied'] = 'true';
    image.src = getProductFallbackImage(product);
  }

  trackByProductId(index: number, product: Product): string | number {
    return product._id || product.id || index;
  }

  onSearchChange(newSearch: string): void {
    this.search = newSearch;
    this.getProducts();
  }

  onColumnCountChange(newCols: number): void {
    this.cols = newCols;
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
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
