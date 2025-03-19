import { TestBed } from '@angular/core/testing';
import { ProductRepository } from './product.repository';
import { Product } from '../../models/product.model';

describe('ProductRepository', () => {
  let repository: ProductRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductRepository],
    });
    repository = TestBed.inject(ProductRepository);
  });

  it('deve criar o repositório', () => {
    expect(repository).toBeTruthy();
  });

  it('deve retornar lista vazia inicialmente', (done) => {
    repository.getAllProducts().subscribe((products) => {
      expect(products).toEqual([]);
      done();
    });
  });

  it('deve criar um novo produto com ID incremental', (done) => {
    const newProduct: Product = {
      id: 0,
      name: 'Produto Teste',
      price: 100,
    };

    repository.createProduct(newProduct).subscribe((created) => {
      expect(created.id).toBe(1);
      expect(created.name).toBe('Produto Teste');
      expect(created.price).toBe(100);

      repository.getAllProducts().subscribe((all) => {
        expect(all.length).toBe(1);
        expect(all[0].id).toBe(1);
        done();
      });
    });
  });

  it('deve retornar o produto pelo ID', (done) => {
    const newProduct: Product = {
      id: 0,
      name: 'Produto XYZ',
      price: 50,
    };

    repository.createProduct(newProduct).subscribe((created) => {
      repository.getProductById(created.id).subscribe((found) => {
        expect(found.name).toBe('Produto XYZ');
        expect(found.price).toBe(50);
        done();
      });
    });
  });

  it('deve lançar erro se getProductById não encontrar o produto', (done) => {
    repository.getProductById(999).subscribe({
      next: () => fail('Esperava erro, mas recebeu next()'),
      error: (err) => {
        expect(err.message).toBe('Product not found');
        done();
      },
    });
  });

  it('deve deletar um produto existente', (done) => {
    const newProduct: Product = {
      id: 0,
      name: 'Para Deletar',
      price: 10,
    };

    repository.createProduct(newProduct).subscribe((created) => {
      repository.deleteProduct(created.id).subscribe(() => {
        repository.getAllProducts().subscribe((all) => {
          expect(all.length).toBe(0);
          done();
        });
      });
    });
  });

  it('deve lançar erro se deleteProduct não encontrar o produto', (done) => {
    repository.deleteProduct(999).subscribe({
      next: () => fail('Esperava erro, mas recebeu next()'),
      error: (err) => {
        expect(err.message).toBe('Product not found');
        done();
      },
    });
  });
});
