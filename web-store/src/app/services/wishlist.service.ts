import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'wishlist';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private itemsSubject = new BehaviorSubject<Product[]>(this.loadFromStorage());
  wishlist$ = this.itemsSubject.asObservable();

  private loadFromStorage(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(items: Product[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  get items(): Product[] {
    return this.itemsSubject.value;
  }

  isInWishlist(product: Product): boolean {
    return this.items.some(item => item._id === product._id);
  }

  toggle(product: Product): void {
    if (this.isInWishlist(product)) {
      this.save(this.items.filter(item => item._id !== product._id));
    } else {
      this.save([...this.items, product]);
    }
  }

  remove(product: Product): void {
    this.save(this.items.filter(item => item._id !== product._id));
  }
}
