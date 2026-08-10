import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, map } from 'rxjs';

const STORE_BASE_URL = `${window.__env.apiUrl}/api`;

// Product image URLs are stored in the database as absolute URLs baked in at
// upload time by the backend (e.g. http://<ec2-ip>:4242/static/foo.png). That
// host is only correct for whichever environment happened to upload the image,
// so anywhere else, notably localhost, the <img> points at a dead or foreign
// host and the picture fails to load. Rewrite the origin to the configured
// apiUrl (env.js: localhost in dev, ${API_URL} substituted at deploy) so images
// always come from the same backend that served the product data. The backend
// serves them from `/static/`, which is the stable part of the path we keep.
function resolveImageUrl(imagePath: string): string {
  if (!imagePath) {
    return imagePath;
  }
  const base = window.__env.apiUrl.replace(/\/$/, '');
  const staticIndex = imagePath.indexOf('/static/');
  const resolved = staticIndex >= 0 ? base + imagePath.slice(staticIndex) : imagePath;
  const separator = resolved.includes('?') ? '&' : '?';
  return `${resolved}${separator}v=20260809`;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private httpClient: HttpClient) {}

  getAllProducts(limit = 'All', sort='desc', category?:string, size='All', min:number=0, max:number=150, search?:string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `${STORE_BASE_URL}/cubes${category ? '/category/' + category : ''}?sort=${sort}&limit=${limit}&size=${size}&minPrice=${min}&maxPrice=${max}${search ? '&search=' + encodeURIComponent(search) : ''}`
      ).pipe(
        map(products => products.map(product => ({ ...product, imagePath: resolveImageUrl(product.imagePath) })))
      );
  }

  getProductById(id: string): Observable<Product> {
    return this.httpClient.get<Product>(
      `${STORE_BASE_URL}/cubes/${id}`
      ).pipe(
        map(product => ({ ...product, imagePath: resolveImageUrl(product.imagePath) }))
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
