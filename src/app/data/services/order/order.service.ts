import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Order } from '../../models/order.model';
import { switchMap, take } from 'rxjs/operators';
import { OrderValidator } from '../../../validators/order.validator';
import { OrderRepository } from '../../repositories/order/order.repository';
import { ProductRepository } from '../../repositories/product/product.repository';


@Injectable({
  providedIn: 'root',
})
export class OrderService {

  constructor(private orderRepository: OrderRepository, private productRepository: ProductRepository) { }

  getAllOrders(): Observable<Order[]> {
    return this.orderRepository.getAllOrders();
  }

  getOrderById(id: number): Observable<Order> {
    return this.orderRepository.getOrderById(id);
  }

  createOrder(order: Order): Observable<Order> {
    try {
      OrderValidator.validateCustomerName(order.customerName);
    } catch (error) {
      return throwError(() => error);
    }
    return this.orderRepository.createOrder(order);
  }
  

  closeOrder(id: number): Observable<Order> {
    return this.getOrderById(id).pipe(
      switchMap((order) => {
        try {
          OrderValidator.validateProductsBeforeClosing(order.products);
        } catch (error) {
          return throwError(() => error);
        }
        return this.orderRepository.closeOrder(id);
      })
    );
  }

  addProductToOrder(orderId: number, productId: number): Observable<Order> {
    return this.orderRepository.getAllOrders().pipe(
      take(1),
          switchMap((orders) => {
            const isInAnotherOrder = orders.some((o) =>
              o.id !== orderId && o.products.some((op) => op.productId === productId)
            );
            if (isInAnotherOrder) {
              return throwError(() => new Error('Product is already in another order'));
            }

            return this.orderRepository.addProductToOrder(orderId, productId);
          })
        );
      }

  removeProductFromOrder(orderId: number, productId: number): Observable<Order> {
    return this.orderRepository.removeProductFromOrder(orderId, productId);
  }
}
