import { Component, EventEmitter, Output, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../data/models/order.model';
import { Product } from '../../../data/models/product.model';
import { OrderService } from '../../../data/services/order/order.service';
import { ProductService } from '../../../data/services/product/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'order-edit-modal',
  templateUrl: 'order-edit-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class OrderEditModalComponent {

  @Input() orderId!: number;        
  @Output() orderEdited = new EventEmitter<void>();
  private modalRef!: NgbModalRef;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  order: Order | null = null;       
  allProducts: Product[] = [];
  allOrders: Order[] = [];
  selectedProductId: number | null = null;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private modalService:  NgbModal
  ) { }


  openEditModal(orderId: number): void {
    this.orderId = orderId;
    if (!this.orderId) return;

    this.modalRef = this.modalService.open(this.modalContent, {
      ariaLabelledBy: 'modal-basic-title',
    });

    this.loadOrderAndData();
  }

  private loadOrderAndData(): void {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (ord) => {
        this.order = ord;
      },
      error: (err) => console.error('Erro ao carregar pedido:', err),
    });

    combineLatest([
      this.orderService.getAllOrders(),
      this.productService.getAllProducts(),
    ]).subscribe({
      next: ([orders, products]) => {
        this.allOrders = orders;
        this.allProducts = products;
      },
      error: (err) => console.error('Erro ao carregar dados:', err),
    });
  }
  get availableProducts(): Product[] {
    if (!this.allOrders || !this.allProducts) {
      return [];
    }
    return this.allProducts.filter((prod) => !this.isInAnyOrder(prod.id));
  }

  private isInAnyOrder(productId: number): boolean {
    return this.allOrders.some((o) =>
      o.products.some((op) => op.productId === productId)
    );
  }

  addProductToOrder(): void {
    if (!this.order || !this.selectedProductId) return;

    this.orderService.addProductToOrder(this.order.id, this.selectedProductId).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.refreshAllOrders();
        this.selectedProductId = null;
      },
      error: (err) => {
        console.error('Erro ao adicionar produto:', err);
      },
    });
  }

  removeProductFromOrder(productId: number): void {
    if (!this.order) return;

    this.orderService.removeProductFromOrder(this.order.id, productId).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.refreshAllOrders();
      },
      error: (err) => {
        console.error('Erro ao remover produto:', err);
      },
    });
  }

  private refreshAllOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.allOrders = orders;
      },
      error: (err) => console.error('Erro ao recarregar orders:', err),
    });
  }


  getProductName(productId: number): string {
    const found = this.allProducts.find((p) => p.id === productId);
    return found ? found.name : '???';
  }

  getProductPrice(productId: number): number | string {
    const found = this.allProducts.find((p) => p.id === productId);
    return found ? found.price : '???';
  }

  saveChanges(): void {
    this.orderEdited.emit();
    this.closeModal();
  }

    closeModal(): void {
      if (this.modalRef) {
        this.modalRef.close();
      }
    }
}
