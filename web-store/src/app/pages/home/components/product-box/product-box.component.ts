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

  product: Product | undefined ={
    id: 1,
    title: 'Zirconium Bastion',
    price: 120,
    category: 'Metal',
    description: 'In the mystical realm of Eldoria, nestled within the ethereal forests of Lumina Glades, there lies a hidden sanctuary known as the Zirconium Bastion. Legend speaks of a magnificent metal cube, forged from the rarest and purest Zirconium, that serves as both protector and keeper of ancient secrets and treasures. The Bastion is guarded by the mighty Zirconium Golem, a creature of immense power and strength, who will stop at nothing to protect the Bastion from those who seek to steal its secrets.',
    image: 'https://via.placeholder.com/150'
  };

  @Output() addToCart = new EventEmitter();

  onAddToCart():void {
    this.addToCart.emit(this.product);
  }
}
