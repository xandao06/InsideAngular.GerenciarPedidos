import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrderCreateModalComponent } from './order-create-modal.component';
import { OrderService } from '../../../data/services/order/order.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../data/models/order.model';

describe('OrderCreateModalComponent', () => {
  let component: OrderCreateModalComponent;
  let fixture: ComponentFixture<OrderCreateModalComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    const oSpy = jasmine.createSpyObj('OrderService', ['createOrder']);
    const mSpy = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [OrderCreateModalComponent],
      providers: [
        { provide: OrderService, useValue: oSpy },
        { provide: NgbModal, useValue: mSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCreateModalComponent);
    component = fixture.componentInstance;

    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#openCreateModal', () => {
    it('deve abrir o modal e resetar o order', () => {
      const mockModalRef: NgbModalRef = {
        close: jasmine.createSpy('close'),
        dismiss: jasmine.createSpy('dismiss'),
        componentInstance: {},
      } as any;

      modalServiceSpy.open.and.returnValue(mockModalRef);

      component.order.customerName = 'Valor antigo';
      component.openCreateModal();

      expect(component.order.customerName).toBe(''); 
      expect(modalServiceSpy.open).toHaveBeenCalled();
      expect(component['modalRef']).toBe(mockModalRef);
    });
  });

  describe('#createOrder', () => {
    let mockModalRef: NgbModalRef;

    beforeEach(() => {
      mockModalRef = {
        close: jasmine.createSpy('close'),
        dismiss: jasmine.createSpy('dismiss'),
        componentInstance: {},
      } as any;
      modalServiceSpy.open.and.returnValue(mockModalRef);

      component.openCreateModal();
    });

    it('deve criar o pedido com sucesso e fechar o modal', () => {
      const mockOrder: Order = {
        id: 0,
        customerName: 'John',
        isClosed: false,
        products: [],
      };
      spyOn(component.orderCreated, 'emit');

      orderServiceSpy.createOrder.and.returnValue(of(mockOrder));

      component.order.customerName = 'John';
      component.createOrder();

      expect(orderServiceSpy.createOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          customerName: 'John',
          isClosed: false,
          products: [],
        })
      );

      expect(component.orderCreated.emit).toHaveBeenCalled();
      expect(mockModalRef.close).toHaveBeenCalled();
      expect(component.errorMessage).toBeNull();
    });

    it('deve exibir erro se falhar ao criar pedido', () => {
      orderServiceSpy.createOrder.and.returnValue(
        throwError(() => new Error('Falha ao criar pedido'))
      );

      component.order.customerName = 'John';
      component.createOrder();

      expect(orderServiceSpy.createOrder).toHaveBeenCalled();
      expect(component.errorMessage).toBe('Falha ao criar pedido');
      expect(mockModalRef.close).not.toHaveBeenCalled();
    });
  });
});
