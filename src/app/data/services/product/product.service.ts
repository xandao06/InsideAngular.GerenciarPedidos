import { Injectable } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductValidator } from '../../../validators/product.validator';
import { ProductRepository } from '../../repositories/product/product.repository';
import { OrderService } from '../order/order.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private productRepository: ProductRepository, private orderService: OrderService) { }

  getAllProducts(): Observable<Product[]> {
    return this.productRepository.getAllProducts();
  }

  getProductById(id: number): Observable<Product> {
    return this.productRepository.getProductById(id);
  }

  createProduct(product: Product): Observable<Product> {
    try {
      ProductValidator.validateName(product.name);
      ProductValidator.validatePrice(product.price);
    } catch (error) {
      return throwError(() => error);
    }
    return this.productRepository.createProduct(product);
  }

  deleteProduct(productId: number): Observable<void> {
    return this.orderService.getAllOrders().pipe(
      switchMap((orders) => {
        try {
          ProductValidator.validateProductInUse(productId, orders);
        } catch (error) {
          return throwError(() => error);
        }
        return this.productRepository.deleteProduct(productId);
      })
    );
  }
}
