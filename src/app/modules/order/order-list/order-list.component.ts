import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../data/models/order.model';
import { OrderService } from '../../../data/services/order/order.service';
import { OrderCloseModalComponent } from '../order-close/order-close-modal.component';
import { OrderCreateModalComponent } from '../order-create/order-create-modal.component';
import { OrderEditModalComponent } from '../order-edit/order-edit-modal.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-order-list',
  templateUrl: 'order-list.component.html',
  standalone: true,
  imports: [CommonModule, OrderCreateModalComponent, OrderEditModalComponent, OrderCloseModalComponent, NgbPagination],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  page = 1;
  pageSize = 10;
  showClosedFirst = false;
  constructor(
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos:', err);
      },
    });
  }

  paginatedOrders(): Order[] {
    const start = (this.page - 1) * this.pageSize;
    const end = this.page * this.pageSize;
    return this.orders.slice(start, end);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
  }

  toggleSortByStatus(): void { 
    this.showClosedFirst = !this.showClosedFirst;
    const sorted = this.orders.slice().sort((a, b) => {
      const aClosed = a.isClosed ? 1 : 0;
      const bClosed = b.isClosed ? 1 : 0;
      return this.showClosedFirst
        ? bClosed - aClosed
        : aClosed - bClosed;
    });
    this.orders = sorted;
  }
}
