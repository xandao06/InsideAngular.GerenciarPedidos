import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrderCloseModalComponent } from './order-close-modal.component';
import { OrderService } from '../../../data/services/order/order.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../data/models/order.model';

describe('OrderCloseModalComponent', () => {
  let component: OrderCloseModalComponent;
  let fixture: ComponentFixture<OrderCloseModalComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    const oSpy = jasmine.createSpyObj('OrderService', ['closeOrder']);
    const mSpy = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [OrderCloseModalComponent],
      providers: [
        { provide: OrderService, useValue: oSpy },
        { provide: NgbModal, useValue: mSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCloseModalComponent);
    component = fixture.componentInstance;

    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#openCloseModal', () => {
    it('não deve abrir o modal se isClosed for true', () => {
      component.openCloseModal(1, true);
      expect(modalServiceSpy.open).not.toHaveBeenCalled();
    });

    it('deve abrir o modal se isClosed for false', () => {
      const mockModalRef: NgbModalRef = {
        close: jasmine.createSpy('close'),
        dismiss: jasmine.createSpy('dismiss'),
        componentInstance: {},
      } as any;

      modalServiceSpy.open.and.returnValue(mockModalRef);

      component.openCloseModal(1, false);
      expect(component.orderId).toBe(1);
      expect(component.isClosed).toBeFalse();
      expect(modalServiceSpy.open).toHaveBeenCalled();
    });
  });

  describe('#closeOrder', () => {
    let mockModalRef: NgbModalRef;

    beforeEach(() => {
      mockModalRef = {
        close: jasmine.createSpy('close'),
        dismiss: jasmine.createSpy('dismiss'),
        componentInstance: {},
      } as any;
      modalServiceSpy.open.and.returnValue(mockModalRef);

      component.openCloseModal(1, false);
    });

    it('deve fechar o pedido com sucesso', () => {

      const closedOrder: Order = {
        id: 123,
        customerName: 'Pedido Teste',
        isClosed: true,
        products: [],
      };

      orderServiceSpy.closeOrder.and.returnValue(of(closedOrder));

      spyOn(component.orderClosed, 'emit');

      component.closeOrder();

      expect(orderServiceSpy.closeOrder).toHaveBeenCalledWith(1);

      expect(component.orderClosed.emit).toHaveBeenCalled();
      expect(mockModalRef.close).toHaveBeenCalled();
    });

    it('deve exibir mensagem de erro se falhar ao fechar', () => {
      orderServiceSpy.closeOrder.and.returnValue(throwError(() => new Error('Falha no fechamento')));

      component.closeOrder();

      expect(orderServiceSpy.closeOrder).toHaveBeenCalledWith(1);
      expect(component.errorMessage).toBe('Falha no fechamento');
      expect(mockModalRef.close).not.toHaveBeenCalled();
    });
  });
});
