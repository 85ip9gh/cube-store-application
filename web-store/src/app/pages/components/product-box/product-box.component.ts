import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-product-box',
  templateUrl: './product-box.component.html',
  styles: [
  ]
})
export class ProductBoxComponent {
  @Input() fullWidthMode:boolean = false;

  @Input() product: Product | undefined;

  @Input() mobile: boolean = false;

  @Output() addToCart = new EventEmitter();

  constructor(private router: Router) {}

  onAddToCart(event: Event):void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onViewProduct(): void {
    if (this.product?._id) {
      this.router.navigate(['/home/cube', this.product._id]);
    }
  }

  // getImageSource(): string {
  //   return `data:image/png;base64,${this.product?.base64Image}`;
  // }
}
