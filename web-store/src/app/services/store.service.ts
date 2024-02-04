import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

// for AWS EC2 instance
//const STORE_BASE_URL = 'http://18.118.238.40:4242';

//for local development
const STORE_BASE_URL = 'http://localhost:4242';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private httpClient: HttpClient) {}

  getAllProducts(limit = 'All', sort='desc', category?:string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `${STORE_BASE_URL}/cubes${category ? '/category/' + category : ''}?sort=${sort}&limit=${limit}`
      );
  }

  getAllCategories(): Observable<string[]> {
    return this.httpClient.get<string[]>(
      `${STORE_BASE_URL}/cubes/categories`
      );
  }
}
