import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductDeleteModalComponent } from './product-delete-modal.component';
import { ProductService } from '../../../data/services/product/product.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

describe('ProductDeleteModalComponent', () => {
  let component: ProductDeleteModalComponent;
  let fixture: ComponentFixture<ProductDeleteModalComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  let mockModalRef: NgbModalRef;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('ProductService', ['deleteProduct']);
    const mSpy = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [ProductDeleteModalComponent],
      providers: [
        { provide: ProductService, useValue: pSpy },
        { provide: NgbModal, useValue: mSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDeleteModalComponent);
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

  describe('#openDeleteModal', () => {
    it('deve abrir o modal e setar productId', () => {
      modalServiceSpy.open.and.returnValue(mockModalRef);

      component.openDeleteModal(123);

      expect(component.productId).toBe(123);
      expect(modalServiceSpy.open).toHaveBeenCalled();
    });
  });

  describe('#deleteProduct', () => {
    beforeEach(() => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openDeleteModal(123);
    });

    it('deve deletar o produto com sucesso e fechar o modal', () => {
      spyOn(component.productDeleted, 'emit');

      productServiceSpy.deleteProduct.and.returnValue(of(undefined));

      component.deleteProduct();

      expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(123);
      expect(component.productDeleted.emit).toHaveBeenCalled();
      expect(mockModalRef.close).toHaveBeenCalled();
    });

    it('deve logar erro se falhar ao deletar', () => {
      spyOn(console, 'error');
      productServiceSpy.deleteProduct.and.returnValue(
        throwError(() => new Error('Falha ao deletar produto'))
      );

      component.deleteProduct();

      expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(123);
      expect(console.error).toHaveBeenCalledWith(
        'Erro ao deletar produto:',
        new Error('Falha ao deletar produto')
      );
      expect(mockModalRef.close).not.toHaveBeenCalled();
    });
  });

  describe('#closeModal', () => {
    it('deve fechar o modal se existir modalRef', () => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openDeleteModal(999);

      component.closeModal();
      expect(mockModalRef.close).toHaveBeenCalled();
    });
  });
});
