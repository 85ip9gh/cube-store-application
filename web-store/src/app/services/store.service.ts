import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

const STORE_BASE_URL = 'http://localhost:4242';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private httpClient: HttpClient) {}

  getAllProducts(limit = '12', sort='desc', category?:string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `${STORE_BASE_URL}/cubes`
      // ${category ? '/category/' + category : ''}?sort=${sort}&limit=${limit}
      );
  }

  getAllCategories(): Observable<string[]> {
    return this.httpClient.get<string[]>(
      `${STORE_BASE_URL}/products/categories`
      );
  }
}
