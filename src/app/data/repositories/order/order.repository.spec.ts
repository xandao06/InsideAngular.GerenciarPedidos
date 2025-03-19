import { TestBed } from '@angular/core/testing';
import { OrderRepository } from './order.repository';
import { take } from 'rxjs/operators';
import { Order } from '../../models/order.model';

describe('OrderRepository', () => {
  let repository: OrderRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderRepository],
    });
    repository = TestBed.inject(OrderRepository);
  });

  it('deve criar o repositório', () => {
    expect(repository).toBeTruthy();
  });

  it('deve retornar array vazio inicialmente', (done) => {
    repository.getAllOrders().subscribe((orders) => {
      expect(orders).toEqual([]);
      done();
    });
  });

  it('deve criar um novo pedido com ID incremental', (done) => {
    const newOrder: Order = {
      id: 0,
      customerName: 'Test',
      isClosed: false,
      products: [],
    };

    repository.createOrder(newOrder).pipe(take(1)).subscribe((created) => {
      expect(created.id).toBe(1);
      expect(created.customerName).toBe('Test');

      repository.getAllOrders().subscribe((all) => {
        expect(all.length).toBe(1);
        expect(all[0].id).toBe(1);
        done();
      });
    });
  });

  it('deve obter um pedido pelo ID', (done) => {
    const newOrder: Order = {
      id: 0,
      customerName: 'ABC',
      isClosed: false,
      products: [],
    };

    repository.createOrder(newOrder).subscribe((created) => {
      repository.getOrderById(created.id).subscribe((found) => {
        expect(found.customerName).toBe('ABC');
        done();
      });
    });
  });

  it('deve lançar erro se getOrderById não encontrar o pedido', () => {
    expect(() => repository.getOrderById(999)).toThrowError('Order not found');
  });

  it('deve fechar um pedido existente', (done) => {
    const newOrder: Order = {
      id: 0,
      customerName: 'ToClose',
      isClosed: false,
      products: [],
    };

    repository.createOrder(newOrder).subscribe((created) => {
      repository.closeOrder(created.id).subscribe((closed) => {
        expect(closed.isClosed).toBeTrue();
        repository.getOrderById(closed.id).subscribe((found) => {
          expect(found.isClosed).toBeTrue();
          done();
        });
      });
    });
  });

  it('deve lançar erro se closeOrder não encontrar o pedido', () => {
    expect(() => repository.closeOrder(999)).toThrowError('Order not found');
  });

  it('deve adicionar um produto ao pedido', (done) => {
    const newOrder: Order = {
      id: 0,
      customerName: 'ProdTest',
      isClosed: false,
      products: [],
    };

    repository.createOrder(newOrder).subscribe((created) => {
      repository.addProductToOrder(created.id, 123).subscribe((updated) => {
        expect(updated.products.length).toBe(1);
        expect(updated.products[0].productId).toBe(123);
        done();
      });
    });
  });

  it('deve lançar erro se addProductToOrder não encontrar o pedido', () => {
    expect(() => repository.addProductToOrder(999, 123)).toThrowError('Order not found');
  });

  it('deve lançar erro se o produto já estiver no pedido', (done) => {
    const newOrder: Order = {
      id: 0,
      customerName: 'DupProd',
      isClosed: false,
      products: [],
    };

    repository.createOrder(newOrder).subscribe((created) => {
      repository.addProductToOrder(created.id, 123).subscribe(() => {
        expect(() => repository.addProductToOrder(created.id, 123))
          .toThrowError('Product is already in this order');
        done();
      });
    });
  });

  it('deve remover um produto do pedido', (done) => {
    const newOrder: Order = {
      id: 0,
      customerName: 'RemoveProd',
      isClosed: false,
      products: [],
    };

    repository.createOrder(newOrder).subscribe((created) => {
      repository.addProductToOrder(created.id, 123).subscribe((updated) => {
        expect(updated.products.length).toBe(1);

        repository.removeProductFromOrder(updated.id, 123).subscribe((final) => {
          expect(final.products.length).toBe(0);
          done();
        });
      });
    });
  });

  it('deve lançar erro se removeProductFromOrder não encontrar o pedido', () => {
    expect(() => repository.removeProductFromOrder(999, 123)).toThrowError('Order not found');
  });
});
