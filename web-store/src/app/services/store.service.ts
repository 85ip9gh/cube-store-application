import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

const STORE_BASE_URL = `${window.__env.apiUrl}/api`;

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private httpClient: HttpClient) {}

  getAllProducts(limit = 'All', sort='desc', category?:string, size='All', min:number=0, max:number=150): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `${STORE_BASE_URL}/cubes${category ? '/category/' + category : ''}?sort=${sort}&limit=${limit}&size=${size}&minPrice=${min}&maxPrice=${max}`
      );
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.httpClient.post<Product>(
      `${STORE_BASE_URL}/cubes`, formData
      );
  }

  updateProduct(id: string, formData: FormData): Observable<Product> {
    return this.httpClient.put<Product>(
      `${STORE_BASE_URL}/cubes/update/${id}`, formData
      );
  }

  deleteProduct(id: string): Observable<Product> {
    return this.httpClient.delete<Product>(
      `${STORE_BASE_URL}/cubes/${id}`
      );
  }

  getAllCategories(): Observable<string[]> {
    return this.httpClient.get<string[]>(
      `${STORE_BASE_URL}/cubes/categories`
      );
  }

  getAllSizes(): Observable<string[]> {
    return this.httpClient.get<string[]>(
      `${STORE_BASE_URL}/cubes/sizes`
      );
  }
}
