import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OrderService } from './order.service';
import { OrderRepository } from '../../repositories/order/order.repository';
import { ProductRepository } from '../../repositories/product/product.repository';
import { Order } from '../../models/order.model';
import { OrderValidator } from '../../../validators/order.validator';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepoSpy: jasmine.SpyObj<OrderRepository>;
  let productRepoSpy: jasmine.SpyObj<ProductRepository>;

  beforeEach(() => {
    const oRepoSpy = jasmine.createSpyObj('OrderRepository', [
      'getAllOrders',
      'getOrderById',
      'createOrder',
      'closeOrder',
      'addProductToOrder',
      'removeProductFromOrder',
    ]);

    const pRepoSpy = jasmine.createSpyObj('ProductRepository', [
      'getAllProducts',
      'getProductById',
      'createProduct',
      'deleteProduct',
    ]);

    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: oRepoSpy },
        { provide: ProductRepository, useValue: pRepoSpy },
      ],
    });

    service = TestBed.inject(OrderService);
    orderRepoSpy = TestBed.inject(OrderRepository) as jasmine.SpyObj<OrderRepository>;
    productRepoSpy = TestBed.inject(ProductRepository) as jasmine.SpyObj<ProductRepository>;
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('#getAllOrders', () => {
    it('deve retornar lista de pedidos', (done) => {
      const mockOrders: Order[] = [
        { id: 1, customerName: 'John Doe', isClosed: false, products: [] },
      ];
      orderRepoSpy.getAllOrders.and.returnValue(of(mockOrders));

      service.getAllOrders().subscribe((orders) => {
        expect(orders).toEqual(mockOrders);
        expect(orderRepoSpy.getAllOrders).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('#getOrderById', () => {
    it('deve retornar o pedido pelo ID', (done) => {
      const mockOrder: Order = { id: 1, customerName: 'John', isClosed: false, products: [] };
      orderRepoSpy.getOrderById.and.returnValue(of(mockOrder));

      service.getOrderById(1).subscribe((order) => {
        expect(order).toEqual(mockOrder);
        expect(orderRepoSpy.getOrderById).toHaveBeenCalledWith(1);
        done();
      });
    });
  });

  describe('#createOrder', () => {
    it('deve criar pedido se a validação do nome passar', (done) => {
      spyOn(OrderValidator, 'validateCustomerName').and.callFake(() => { });

      const newOrder: Order = {
        id: 0,
        customerName: 'Jane',
        isClosed: false,
        products: [],
      };
      const createdOrder: Order = {
        id: 1,
        customerName: 'Jane',
        isClosed: false,
        products: [],
      };

      orderRepoSpy.createOrder.and.returnValue(of(createdOrder));

      service.createOrder(newOrder).subscribe((result) => {
        expect(result).toEqual(createdOrder);
        expect(OrderValidator.validateCustomerName).toHaveBeenCalledWith('Jane');
        expect(orderRepoSpy.createOrder).toHaveBeenCalledWith(newOrder);
        done();
      });
    });

    it('deve lançar erro se o nome do cliente for inválido', (done) => {
      spyOn(OrderValidator, 'validateCustomerName').and.throwError('Nome inválido');

      const invalidOrder: Order = {
        id: 0,
        customerName: '',
        isClosed: false,
        products: [],
      };

      service.createOrder(invalidOrder).subscribe({
        next: () => fail('Esperava erro de validação'),
        error: (err) => {
          expect(err.message).toBe('Nome inválido');
          done();
        },
      });
    });
  });

  describe('#closeOrder', () => {
    it('deve fechar o pedido se houver produtos', (done) => {
      spyOn(OrderValidator, 'validateProductsBeforeClosing').and.callFake(() => { });

      const existingOrder: Order = {
        id: 1,
        customerName: 'Order1',
        isClosed: false,
        products: [{ productId: 10, orderId: 1 }],
      };
      const closedOrder: Order = {
        ...existingOrder,
        isClosed: true,
      };

      orderRepoSpy.getOrderById.and.returnValue(of(existingOrder));
      orderRepoSpy.closeOrder.and.returnValue(of(closedOrder));

      service.closeOrder(1).subscribe((result) => {
        expect(result.isClosed).toBeTrue();
        expect(OrderValidator.validateProductsBeforeClosing).toHaveBeenCalledWith(existingOrder.products);
        expect(orderRepoSpy.closeOrder).toHaveBeenCalledWith(1);
        done();
      });
    });

    it('deve lançar erro se não houver produtos', (done) => {
      const existingOrder: Order = {
        id: 2,
        customerName: 'Order2',
        isClosed: false,
        products: [],
      };

      orderRepoSpy.getOrderById.and.returnValue(of(existingOrder));
      spyOn(OrderValidator, 'validateProductsBeforeClosing').and.throwError('Adicione pelo menos um produto antes de fechar o pedido');

      service.closeOrder(2).subscribe({
        next: () => fail('Esperava erro'),
        error: (err) => {
          expect(err.message).toBe('Adicione pelo menos um produto antes de fechar o pedido');
          done();
        },
      });
    });
  });

  describe('#addProductToOrder', () => {
    it('deve lançar erro se o produto estiver em outro pedido', (done) => {
      const mockOrders: Order[] = [
        {
          id: 1,
          customerName: 'Order1',
          isClosed: false,
          products: [{ productId: 10, orderId: 1 }],
        },
        {
          id: 2,
          customerName: 'Order2',
          isClosed: false,
          products: [],
        },
      ];

      orderRepoSpy.getAllOrders.and.returnValue(of(mockOrders));

      service.addProductToOrder(2, 10).subscribe({
        next: () => fail('Esperava erro'),
        error: (err) => {
          expect(err.message).toBe('Product is already in another order');
          done();
        },
      });
    });

    it('deve adicionar produto se não estiver em outro pedido', (done) => {
      const mockOrders: Order[] = [
        {
          id: 1,
          customerName: 'Order1',
          isClosed: false,
          products: [{ productId: 9, orderId: 1 }],
        },
        {
          id: 2,
          customerName: 'Order2',
          isClosed: false,
          products: [],
        },
      ];
      orderRepoSpy.getAllOrders.and.returnValue(of(mockOrders));

      const updatedOrder: Order = {
        id: 2,
        customerName: 'Order2',
        isClosed: false,
        products: [{ productId: 10, orderId: 2 }],
      };
      orderRepoSpy.addProductToOrder.and.returnValue(of(updatedOrder));

      service.addProductToOrder(2, 10).subscribe((result) => {
        expect(result).toEqual(updatedOrder);
        expect(orderRepoSpy.addProductToOrder).toHaveBeenCalledWith(2, 10);
        done();
      });
    });
  });

  describe('#removeProductFromOrder', () => {
    it('deve chamar removeProductFromOrder do repositório', (done) => {
      const mockOrder: Order = {
        id: 1,
        customerName: 'Order1',
        isClosed: false,
        products: [],
      };
      orderRepoSpy.removeProductFromOrder.and.returnValue(of(mockOrder));

      service.removeProductFromOrder(1, 10).subscribe((res) => {
        expect(res).toEqual(mockOrder);
        expect(orderRepoSpy.removeProductFromOrder).toHaveBeenCalledWith(1, 10);
        done();
      });
    });
  });
});
