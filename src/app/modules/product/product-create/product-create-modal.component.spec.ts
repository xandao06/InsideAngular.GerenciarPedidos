import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductCreateModalComponent } from './product-create-modal.component';
import { ProductService } from '../../../data/services/product/product.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Product } from '../../../data/models/product.model';

describe('ProductCreateModalComponent', () => {
  let component: ProductCreateModalComponent;
  let fixture: ComponentFixture<ProductCreateModalComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  let mockModalRef: NgbModalRef;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('ProductService', ['createProduct']);
    const mSpy = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [ProductCreateModalComponent],
      providers: [
        { provide: ProductService, useValue: pSpy },
        { provide: NgbModal, useValue: mSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCreateModalComponent);
    component = fixture.componentInstance;

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;

    mockModalRef = {
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss'),
      componentInstance: {},
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#openCreateModal', () => {
    it('deve abrir o modal e resetar o product', () => {
      modalServiceSpy.open.and.returnValue(mockModalRef);

      component.product.name = 'Old Name';
      component.product.price = 999;

      component.openCreateModal();

      expect(component.product.name).toBe('');
      expect(component.product.price).toBeUndefined();

      expect(modalServiceSpy.open).toHaveBeenCalled();
    });
  });

  describe('#createProduct', () => {
    beforeEach(() => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openCreateModal();
    });

    it('deve criar o produto com sucesso e fechar o modal', () => {
      spyOn(component.productCreated, 'emit');

      const newProduct: Product = { id: 1, name: 'Produto Teste', price: 50 };
      productServiceSpy.createProduct.and.returnValue(of(newProduct));

      component.product.name = 'Produto Teste';
      component.product.price = 50;

      component.createProduct();

      expect(productServiceSpy.createProduct).toHaveBeenCalledWith({
        name: 'Produto Teste',
        price: 50,
      } as Product);

      expect(component.productCreated.emit).toHaveBeenCalled();
      expect(mockModalRef.close).toHaveBeenCalled();
      expect(component.errorMessage).toBeNull();
    });

    it('deve exibir mensagem de erro se falhar ao criar produto', () => {
      productServiceSpy.createProduct.and.returnValue(
        throwError(() => new Error('Falha ao criar produto'))
      );

      component.product.name = 'Produto X';
      component.product.price = 0;

      component.createProduct();

      expect(productServiceSpy.createProduct).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Falha ao criar produto');
      expect(mockModalRef.close).not.toHaveBeenCalled();
    });
  });

  describe('#closeModal', () => {
    it('deve fechar o modal se existir modalRef', () => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openCreateModal();

      component.closeModal();
      expect(mockModalRef.close).toHaveBeenCalled();
    });
  });
});
