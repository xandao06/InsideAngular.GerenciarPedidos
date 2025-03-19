import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductService } from './product.service';
import { ProductRepository } from '../../repositories/product/product.repository';
import { OrderService } from '../order/order.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';
import { ProductValidator } from '../../../validators/product.validator';

describe('ProductService', () => {
  let service: ProductService;
  let productRepoSpy: jasmine.SpyObj<ProductRepository>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  beforeEach(() => {
    // Cria "spies" para o ProductRepository e o OrderService
    const repoSpy = jasmine.createSpyObj('ProductRepository', [
      'getAllProducts',
      'getProductById',
      'createProduct',
      'deleteProduct',
    ]);

    const ordSpy = jasmine.createSpyObj('OrderService', [
      'getAllOrders',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: repoSpy },
        { provide: OrderService, useValue: ordSpy },
      ],
    });

    service = TestBed.inject(ProductService);
    productRepoSpy = TestBed.inject(ProductRepository) as jasmine.SpyObj<ProductRepository>;
    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('#getAllProducts', () => {
    it('deve retornar todos os produtos do repositório', (done) => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Product A', price: 100 },
        { id: 2, name: 'Product B', price: 200 },
      ];
      productRepoSpy.getAllProducts.and.returnValue(of(mockProducts));

      service.getAllProducts().subscribe((products) => {
        expect(products).toEqual(mockProducts);
        expect(productRepoSpy.getAllProducts).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('#getProductById', () => {
    it('deve retornar o produto pelo ID', (done) => {
      const mockProduct: Product = { id: 1, name: 'Product A', price: 100 };
      productRepoSpy.getProductById.and.returnValue(of(mockProduct));

      service.getProductById(1).subscribe((product) => {
        expect(product).toEqual(mockProduct);
        expect(productRepoSpy.getProductById).toHaveBeenCalledWith(1);
        done();
      });
    });
  });

  describe('#createProduct', () => {
    it('deve criar o produto se as validações passarem', (done) => {
      spyOn(ProductValidator, 'validateName').and.callFake(() => { });
      spyOn(ProductValidator, 'validatePrice').and.callFake(() => { });

      const newProduct: Product = { id: 0, name: 'Novo Produto', price: 99 };
      const createdProduct: Product = { id: 1, name: 'Novo Produto', price: 99 };

      productRepoSpy.createProduct.and.returnValue(of(createdProduct));

      service.createProduct(newProduct).subscribe((result) => {
        expect(result).toEqual(createdProduct);
        expect(ProductValidator.validateName).toHaveBeenCalledWith('Novo Produto');
        expect(ProductValidator.validatePrice).toHaveBeenCalledWith(99);
        expect(productRepoSpy.createProduct).toHaveBeenCalledWith(newProduct);
        done();
      });
    });

    it('deve lançar erro se o nome do produto for inválido', (done) => {
      spyOn(ProductValidator, 'validateName').and.throwError('Nome inválido');
      spyOn(ProductValidator, 'validatePrice').and.callFake(() => { });

      const invalidProduct: Product = { id: 0, name: '', price: 100 };

      service.createProduct(invalidProduct).subscribe({
        next: () => fail('Esperava erro de nome inválido'),
        error: (err) => {
          expect(err.message).toBe('Nome inválido');
          done();
        },
      });
    });

    it('deve lançar erro se o preço for inválido', (done) => {
      spyOn(ProductValidator, 'validateName').and.callFake(() => { });
      spyOn(ProductValidator, 'validatePrice').and.throwError('Preço deve ser maior que zero');

      const invalidProduct: Product = { id: 0, name: 'Produto X', price: 0 };

      service.createProduct(invalidProduct).subscribe({
        next: () => fail('Esperava erro de preço inválido'),
        error: (err) => {
          expect(err.message).toBe('Preço deve ser maior que zero');
          done();
        },
      });
    });
  });

  describe('#deleteProduct', () => {
    it('deve deletar o produto se não estiver em uso', (done) => {
      const mockOrders: Order[] = [
        { id: 1, customerName: 'John', isClosed: false, products: [{ productId: 999, orderId: 1 }] }
      ];
      orderServiceSpy.getAllOrders.and.returnValue(of(mockOrders));

      productRepoSpy.deleteProduct.and.returnValue(of(undefined));

      service.deleteProduct(123).subscribe({
        next: () => {
          expect(orderServiceSpy.getAllOrders).toHaveBeenCalled();
          expect(productRepoSpy.deleteProduct).toHaveBeenCalledWith(123);
          done();
        },
        error: (err) => {
          fail('Não deveria falhar se não está em uso');
          done();
        },
      });
    });

    it('deve lançar erro se o produto estiver em uso', (done) => {
      const mockOrders: Order[] = [
        { id: 1, customerName: 'John', isClosed: false, products: [{ productId: 123, orderId: 1 }] }
      ];
      orderServiceSpy.getAllOrders.and.returnValue(of(mockOrders));
      productRepoSpy.deleteProduct.and.returnValue(of(undefined));

      service.deleteProduct(123).subscribe({
        next: () => {
          fail('Esperava erro pois o produto está em uso');
          done();
        },
        error: (err) => {
          expect(orderServiceSpy.getAllOrders).toHaveBeenCalled();
          expect(productRepoSpy.deleteProduct).not.toHaveBeenCalled();
          expect(err.message).toBe('Não é possível deletar o produto pois ele está em uso em um pedido.');
          done();
        },
      });
    });
  });
})
