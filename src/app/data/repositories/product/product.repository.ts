import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductRepository {

  public productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();


  getAllProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProductById(productId: number): Observable<Product> {
    const products = this.productsSubject.value;
    const found = products.find((p) => p.id === productId);
    if (!found) {
      return throwError(() => new Error('Product not found'));
    }
    return of(found);
  }

  createProduct(newProduct: Product): Observable<Product> {
    const products = this.productsSubject.value;
    const maxId = products.length > 0 ? Math.max(...products.map((p) => p.id)) : 0;
    newProduct.id = maxId + 1;

    const updated = [...products, newProduct];
    this.productsSubject.next(updated);

    return of(newProduct);
  }

  deleteProduct(productId: number): Observable<void> {
    const products = this.productsSubject.value;
    const updated = products.filter((p) => p.id !== productId);
    if (updated.length === products.length) {
      return throwError(() => new Error('Product not found'));
    }

    this.productsSubject.next(updated);
    return of(undefined);
  }
}

