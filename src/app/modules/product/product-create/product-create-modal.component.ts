import { Component, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from '../../../data/models/product.model';
import { ProductService } from '../../../data/services/product/product.service';


@Component({
  selector: 'create-product-modal',
  standalone: true,
  templateUrl: 'product-create-modal.component.html',
  imports: [CommonModule, FormsModule],
})
export class ProductCreateModalComponent {

  @Output() productCreated = new EventEmitter<void>();
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  private modalRef!: NgbModalRef;
  errorMessage: string | null = null;

  product: Partial<Product> = {
    name: '',
  };

  constructor(
    private productService: ProductService,
    private modalService: NgbModal
  ) { }

  openCreateModal() {
    this.product = { name: '', price: undefined };
    this.errorMessage = null;
    this.modalRef = this.modalService.open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' });
  }

  createProduct(): void {
    this.productService.createProduct(this.product as Product).subscribe({
      next: () => {
        this.productCreated.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao criar produto:', err);
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
