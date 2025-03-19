import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrderEditModalComponent } from './order-edit-modal.component';
import { OrderService } from '../../../data/services/order/order.service';
import { ProductService } from '../../../data/services/product/product.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../data/models/order.model';
import { Product } from '../../../data/models/product.model';

describe('OrderEditModalComponent', () => {
  let component: OrderEditModalComponent;
  let fixture: ComponentFixture<OrderEditModalComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  let mockModalRef: NgbModalRef;

  beforeEach(async () => {
    const oSpy = jasmine.createSpyObj('OrderService', [
      'getOrderById',
      'getAllOrders',
      'addProductToOrder',
      'removeProductFromOrder',
    ]);
    const pSpy = jasmine.createSpyObj('ProductService', ['getAllProducts']);
    const mSpy = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [OrderEditModalComponent],
      providers: [
        { provide: OrderService, useValue: oSpy },
        { provide: ProductService, useValue: pSpy },
        { provide: NgbModal, useValue: mSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderEditModalComponent);
    component = fixture.componentInstance;

    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;

    mockModalRef = {
      close: jasmine.createSpy('close'),
      dismiss: jasmine.createSpy('dismiss'),
      componentInstance: {},
    } as any;
  });

  beforeEach(() => {
    orderServiceSpy.getAllOrders.and.returnValue(of([]));
    productServiceSpy.getAllProducts.and.returnValue(of([]));

    orderServiceSpy.getOrderById.and.returnValue(
      of({ id: 999, customerName: 'Default', isClosed: false, products: [] })
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#openEditModal', () => {
    it('não faz nada se orderId for falsy', () => {
      component.openEditModal(0); 
      expect(modalServiceSpy.open).not.toHaveBeenCalled();
    });

    it('deve setar orderId, abrir o modal e chamar loadOrderAndData', () => {
      spyOn(component as any, 'loadOrderAndData'); 
      modalServiceSpy.open.and.returnValue(mockModalRef);

      component.openEditModal(123);
      expect(component.orderId).toBe(123);
      expect(modalServiceSpy.open).toHaveBeenCalled();
      expect(component['loadOrderAndData']).toHaveBeenCalled();
    });
  });

  describe('#loadOrderAndData (privado)', () => {
    it('deve carregar o pedido e as listas de orders/products', () => {
      spyOn(console, 'error');

      const mockOrder: Order = { id: 123, customerName: 'Test', isClosed: false, products: [] };
      orderServiceSpy.getOrderById.and.returnValue(of(mockOrder));

      const mockAllOrders: Order[] = [mockOrder];
      const mockAllProducts: Product[] = [
        { id: 10, name: 'Prod A', price: 100 },
        { id: 11, name: 'Prod B', price: 200 },
      ];

      orderServiceSpy.getAllOrders.and.returnValue(of(mockAllOrders));
      productServiceSpy.getAllProducts.and.returnValue(of(mockAllProducts));

      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openEditModal(123);

      expect(orderServiceSpy.getOrderById).toHaveBeenCalledWith(123);

      fixture.detectChanges();

      expect(component.order).toEqual(mockOrder);
      expect(component.allOrders).toEqual(mockAllOrders);
      expect(component.allProducts).toEqual(mockAllProducts);
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('#addProductToOrder', () => {
    beforeEach(() => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openEditModal(1);

      component.order = {
        id: 1,
        customerName: 'Order1',
        isClosed: false,
        products: [],
      };
    });

    it('não faz nada se order ou selectedProductId for null', () => {
      component.selectedProductId = null;
      component.addProductToOrder();
      expect(orderServiceSpy.addProductToOrder).not.toHaveBeenCalled();
    });

    it('deve adicionar produto e chamar refreshAllOrders ao sucesso', () => {
      spyOn(component as any, 'refreshAllOrders').and.callFake(() => { });
      component.selectedProductId = 10;

      const updatedOrder: Order = {
        id: 1,
        customerName: 'Order1',
        isClosed: false,
        products: [{ productId: 10, orderId: 1 }],
      };

      orderServiceSpy.addProductToOrder.and.returnValue(of(updatedOrder));

      component.addProductToOrder();
      expect(orderServiceSpy.addProductToOrder).toHaveBeenCalledWith(1, 10);
      expect(component.order).toEqual(updatedOrder);
      expect(component['refreshAllOrders']).toHaveBeenCalled();
      expect(component.selectedProductId).toBeNull();
    });

    it('deve logar erro se falhar ao adicionar', () => {
      spyOn(console, 'error');
      component.selectedProductId = 10;
      orderServiceSpy.addProductToOrder.and.returnValue(
        throwError(() => new Error('Falha ao adicionar'))
      );

      component.addProductToOrder();
      expect(console.error).toHaveBeenCalledWith('Erro ao adicionar produto:', new Error('Falha ao adicionar'));
    });
  });

  describe('#removeProductFromOrder', () => {
    beforeEach(() => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openEditModal(1);
      component.order = {
        id: 1,
        customerName: 'Order1',
        isClosed: false,
        products: [{ productId: 10, orderId: 1 }],
      };
    });

    it('não faz nada se order for null', () => {
      component.order = null;
      component.removeProductFromOrder(10);
      expect(orderServiceSpy.removeProductFromOrder).not.toHaveBeenCalled();
    });

    it('deve remover produto e chamar refreshAllOrders ao sucesso', () => {
      spyOn(component as any, 'refreshAllOrders').and.callFake(() => { });
      const updatedOrder: Order = {
        id: 1,
        customerName: 'Order1',
        isClosed: false,
        products: [],
      };
      orderServiceSpy.removeProductFromOrder.and.returnValue(of(updatedOrder));

      component.removeProductFromOrder(10);
      expect(orderServiceSpy.removeProductFromOrder).toHaveBeenCalledWith(1, 10);
      expect(component.order).toEqual(updatedOrder);
      expect(component['refreshAllOrders']).toHaveBeenCalled();
    });

    it('deve logar erro se falhar ao remover', () => {
      spyOn(console, 'error');
      orderServiceSpy.removeProductFromOrder.and.returnValue(
        throwError(() => new Error('Falha ao remover'))
      );

      component.removeProductFromOrder(10);
      expect(console.error).toHaveBeenCalledWith('Erro ao remover produto:', new Error('Falha ao remover'));
    });
  });

  describe('#saveChanges', () => {
    it('deve emitir orderEdited e fechar o modal', () => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      spyOn(component.orderEdited, 'emit');

      component.openEditModal(1);
      component.saveChanges();

      expect(component.orderEdited.emit).toHaveBeenCalled();
      expect(mockModalRef.close).toHaveBeenCalled();
    });
  });

  describe('#closeModal', () => {
    it('deve fechar o modal se existir modalRef', () => {
      modalServiceSpy.open.and.returnValue(mockModalRef);
      component.openEditModal(1);

      component.closeModal();
      expect(mockModalRef.close).toHaveBeenCalled();
    });
  });

  describe('#availableProducts getter', () => {
    it('deve retornar somente produtos não presentes em nenhum pedido', () => {
      component.allProducts = [
        { id: 10, name: 'Prod A', price: 100 },
        { id: 11, name: 'Prod B', price: 200 },
      ];
      component.allOrders = [
        {
          id: 1,
          customerName: 'Order1',
          isClosed: false,
          products: [{ productId: 10, orderId: 1 }],
        },
      ];

      const result = component.availableProducts;
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(11);
    });
  });

  describe('#getProductName', () => {
    it('deve retornar o nome do produto se encontrado, caso contrário ???', () => {
      component.allProducts = [
        { id: 10, name: 'Prod A', price: 100 },
      ];

      expect(component.getProductName(10)).toBe('Prod A');
      expect(component.getProductName(999)).toBe('???');
    });
  });

  describe('#getProductPrice', () => {
    it('deve retornar o preço do produto se encontrado, caso contrário ???', () => {
      component.allProducts = [
        { id: 10, name: 'Prod A', price: 100 },
      ];

      expect(component.getProductPrice(10)).toBe(100);
      expect(component.getProductPrice(999)).toBe('???');
    });
  });
});
