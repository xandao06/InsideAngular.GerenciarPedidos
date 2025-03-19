import { Component, Output, EventEmitter, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../data/services/order/order.service';

@Component({
  selector: 'close-order-modal',
  standalone: true,
  templateUrl: 'order-close-modal.component.html',
  imports: [CommonModule, FormsModule],
})
export class OrderCloseModalComponent {

  @Input() orderId!: number;               
  @Output() orderClosed = new EventEmitter<void>(); 
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  private modalRef!: NgbModalRef;
  isClosed: boolean = false;
  errorMessage: string | null = null;
  constructor(
    private orderService: OrderService,
    private modalService: NgbModal
  ) { }


  openCloseModal(orderId: number, isClosed: boolean) {
    if (isClosed) return;
    this.errorMessage = null;

    this.orderId = orderId;
      this.isClosed = isClosed;
      this.modalRef = this.modalService.open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' });
    }

  closeOrder(): void {
    this.orderService.closeOrder(this.orderId).subscribe({
      next: () => {
        this.orderClosed.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao fechar pedido:', err);
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
