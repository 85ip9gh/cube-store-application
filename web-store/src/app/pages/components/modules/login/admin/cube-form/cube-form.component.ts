import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from 'src/app/models/product.model';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-cube-form',
  templateUrl: './cube-form.component.html',
})
export class CubeFormComponent {
  title: string;
  price: number;
  category: string;
  size: string;
  age: number;
  description: string;
  imageFile: File | null = null;
  saving: boolean = false;
  errorMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<CubeFormComponent>,
    private storeService: StoreService,
    @Inject(MAT_DIALOG_DATA) public product: Product | null
  ) {
    this.title = product?.title ?? '';
    this.price = product?.price ?? 0;
    this.category = product?.category ?? '';
    this.size = product?.size ?? '';
    this.age = product?.age ?? 0;
    this.description = product?.description ?? '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFile = input.files && input.files.length ? input.files[0] : null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.product && !this.imageFile) {
      this.errorMessage = 'An image is required for a new cube';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('price', String(this.price));
    formData.append('category', this.category);
    formData.append('size', this.size);
    formData.append('age', String(this.age));
    formData.append('description', this.description);
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.saving = true;
    this.errorMessage = '';

    const request = this.product
      ? this.storeService.updateProduct(this.product._id!, formData)
      : this.storeService.createProduct(formData);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Failed to save cube';
      }
    });
  }
}
