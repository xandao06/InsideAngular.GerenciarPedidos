import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../../../data/services/order/order.service';
import { Order } from '../../../data/models/order.model';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    const oSpy = jasmine.createSpyObj('OrderService', ['getAllOrders']);

    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        { provide: OrderService, useValue: oSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;

    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit', () => {
    it('deve chamar loadOrders ao inicializar', () => {
      spyOn(component, 'loadOrders').and.callFake(() => { });
      fixture.detectChanges();
      expect(component.loadOrders).toHaveBeenCalled();
    });
  });

  describe('#loadOrders', () => {
    it('deve carregar pedidos com sucesso', () => {
      const mockOrders: Order[] = [
        { id: 1, customerName: 'John', isClosed: false, products: [] },
        { id: 2, customerName: 'Jane', isClosed: true, products: [] },
      ];
      orderServiceSpy.getAllOrders.and.returnValue(of(mockOrders));

      component.loadOrders();

      expect(orderServiceSpy.getAllOrders).toHaveBeenCalled();
      expect(component.orders).toEqual(mockOrders);
    });

    it('deve logar erro se falhar ao carregar pedidos', () => {
      spyOn(console, 'error');
      orderServiceSpy.getAllOrders.and.returnValue(throwError(() => new Error('Falha')));

      component.loadOrders();

      expect(orderServiceSpy.getAllOrders).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar pedidos:', new Error('Falha'));
      expect(component.orders.length).toBe(0);
    });
  });

  describe('#paginatedOrders', () => {
    it('deve retornar um slice do array de pedidos de acordo com page e pageSize', () => {
      component.orders = [
        { id: 1, customerName: 'A', isClosed: false, products: [] },
        { id: 2, customerName: 'B', isClosed: false, products: [] },
        { id: 3, customerName: 'C', isClosed: false, products: [] },
        { id: 4, customerName: 'D', isClosed: false, products: [] },
      ];
      component.page = 2;
      component.pageSize = 2;

      const result = component.paginatedOrders();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(4);
    });
  });

  describe('#onPageChange', () => {
    it('deve atualizar a propriedade page', () => {
      component.page = 1;
      component.onPageChange(3);
      expect(component.page).toBe(3);
    });
  });

  describe('#toggleSortByStatus', () => {
    it('deve alternar showClosedFirst e reordenar a lista', () => {
      component.orders = [
        { id: 1, customerName: 'A', isClosed: false, products: [] },
        { id: 2, customerName: 'B', isClosed: true, products: [] },
        { id: 3, customerName: 'C', isClosed: false, products: [] },
      ];
      component.showClosedFirst = false;

      component.toggleSortByStatus();
      expect(component.showClosedFirst).toBeTrue();
      expect(component.orders[0].id).toBe(2); 

      component.toggleSortByStatus();
      expect(component.showClosedFirst).toBeFalse();
      expect(component.orders[0].id).toBe(1);
      expect(component.orders[1].id).toBe(3);
      expect(component.orders[2].id).toBe(2);
    });
  });
});
