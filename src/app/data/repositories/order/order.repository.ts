import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Order } from '../../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderRepository {

  public ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  getAllOrders(): Observable<Order[]> {
    return this.orders$;
  }

  createOrder(order: Order): Observable<Order> {
    const orders = this.ordersSubject.value; 
    const maxId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) : 0;
    order.id = maxId + 1;
    order.products = order.products || [];

    const updated = [...orders, order];
    this.ordersSubject.next(updated); 
    return of(order);                 
  }

  getOrderById(id: number): Observable<Order> {
    const orders = this.ordersSubject.value;
    const found = orders.find(o => o.id === id);
    if (!found) {
      throw new Error('Order not found');
    }
    return of(found);
  }

  closeOrder(id: number): Observable<Order> {
    const orders = this.ordersSubject.value;
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
      throw new Error('Order not found');
    }

    orders[index] = { ...orders[index], isClosed: true };
    this.ordersSubject.next([...orders]); 
    return of(orders[index]);             
  }

  addProductToOrder(orderId: number, productId: number): Observable<Order> {
    const orders = this.ordersSubject.value;
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) {
      throw new Error('Order not found');
    }

    const order = { ...orders[index] };
    if (!order.products) {
      order.products = [];
    }

    const existing = order.products.find(op => op.productId === productId);
    if (existing) {
      throw new Error('Product is already in this order');
    }

    order.products.push({ productId, orderId });
    orders[index] = order;

    this.ordersSubject.next([...orders]);
    return of(order);
  }

  removeProductFromOrder(orderId: number, productId: number): Observable<Order> {
    const orders = this.ordersSubject.value;
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    const order = { ...orders[orderIndex] };
    order.products = order.products.filter(p => p.productId !== productId);
    orders[orderIndex] = order;

    this.ordersSubject.next([...orders]);
    return of(order);
  }
}
