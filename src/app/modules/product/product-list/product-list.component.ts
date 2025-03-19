import { Component, OnInit } from '@angular/core';
import { Product } from '../../../data/models/product.model';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../data/services/product/product.service';
import { ProductCreateModalComponent } from '../product-create/product-create-modal.component';
import { ProductDeleteModalComponent } from '../product-delete/product-delete-modal.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-product-list',
  templateUrl: 'product-list.component.html',
  standalone: true,
  imports: [CommonModule, ProductCreateModalComponent, ProductDeleteModalComponent, NgbPagination],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  page = 1;       
  pageSize = 10;

  constructor(
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Erro ao carregar produtos:', err);
      },
    });
  }

  paginatedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    const end = this.page * this.pageSize;
    return this.products.slice(start, end);
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
  }
}
