import { Component, Output, EventEmitter, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../data/services/product/product.service';


@Component({
  selector: 'delete-product-modal',
  standalone: true,
  templateUrl: 'product-delete-modal.component.html',
  imports: [CommonModule, FormsModule],
})
export class ProductDeleteModalComponent {

  @Input() productId!: number;
  @Output() productDeleted = new EventEmitter<void>();
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  private modalRef!: NgbModalRef;
  errorMessage: string | null = null;
  constructor(
    private productService: ProductService,
    private modalService: NgbModal
  ) { }

  openDeleteModal(productId: number) {
    this.errorMessage = null;
    this.productId = productId;
    this.modalRef = this.modalService.open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' });
  }

  deleteProduct(): void {
    this.productService.deleteProduct(this.productId).subscribe({
      next: () => {
        this.productDeleted.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao deletar produto:', err);
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

