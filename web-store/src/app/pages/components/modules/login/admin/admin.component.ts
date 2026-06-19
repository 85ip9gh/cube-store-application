import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { AuthService } from 'src/app/services/auth.service';
import { StoreService } from 'src/app/services/store.service';
import { CubeFormComponent } from './cube-form/cube-form.component';

@Component({
  selector: 'app-admin',
  templateUrl:'./admin.component.html',
})
export class AdminComponent {

  products: Product[] = [];
  displayedColumns: string[] = ['image', 'title', 'price', 'category', 'size', 'actions'];

  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.storeService.getAllProducts().subscribe(products => {
      this.products = products;
    });
  }

  onAddCube(): void {
    const dialogRef = this.dialog.open(CubeFormComponent, { data: null });
    dialogRef.afterClosed().subscribe(saved => {
      if (saved) {
        this.loadProducts();
      }
    });
  }

  onEditCube(product: Product): void {
    const dialogRef = this.dialog.open(CubeFormComponent, { data: product });
    dialogRef.afterClosed().subscribe(saved => {
      if (saved) {
        this.loadProducts();
      }
    });
  }

  onDeleteCube(product: Product): void {
    if (!confirm(`Delete "${product.title}"?`)) {
      return;
    }
    this.storeService.deleteProduct(product._id!).subscribe(() => {
      this.loadProducts();
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
