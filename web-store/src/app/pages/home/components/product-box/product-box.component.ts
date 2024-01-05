import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  @Output() addToCart = new EventEmitter();

  onAddToCart():void {
    this.addToCart.emit(this.product);
  }

  getImageSource(): string {
    // Assuming the base64Image property is present in each item
    return `data:image/png;base64,${this.product?.base64Image}`;
  }
}
