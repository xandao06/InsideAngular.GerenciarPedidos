import { Component, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../data/models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../data/services/order/order.service';

@Component({
  selector: 'create-order-modal',
  standalone: true,
  templateUrl: 'order-create-modal.component.html',
  imports: [CommonModule, FormsModule]
})
export class OrderCreateModalComponent {

  @Output() orderCreated = new EventEmitter<void>();
  private modalRef!: NgbModalRef;
  errorMessage: string | null = null;

  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  order: Partial<Order> = {
    id:0,
    customerName: '',
    isClosed: false,
    products: [],
  };

  constructor(
    private orderService: OrderService,
    private modalService: NgbModal
  ) { }

  openCreateModal() {
    this.order = {
      id: 0,
      customerName: '',
      isClosed: false,
      products: [],
    };
    this.errorMessage = null;
      this.modalRef = this.modalService.open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' });
    }

  createOrder(): void {
    this.orderService.createOrder(this.order as Order).subscribe({
      next: () => {
        this.orderCreated.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao criar pedido:', err);
        this.errorMessage = err.message;
      },
    });
  }

  closeModal() {
      if (this.modalRef) {
        this.modalRef.close();
      }
    }
}
