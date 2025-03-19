import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../data/services/product/product.service';
import { Product } from '../../../data/models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('ProductService', ['getAllProducts']);

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: pSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit', () => {
    it('deve chamar loadProducts ao inicializar', () => {
      spyOn(component, 'loadProducts');
      fixture.detectChanges(); 
      expect(component.loadProducts).toHaveBeenCalled();
    });
  });

  describe('#loadProducts', () => {
    it('deve carregar produtos com sucesso', () => {
      const mockProducts: Product[] = [
        { id: 1, name: 'Produto A', price: 100 },
        { id: 2, name: 'Produto B', price: 200 },
      ];
      productServiceSpy.getAllProducts.and.returnValue(of(mockProducts));

      component.loadProducts();

      expect(productServiceSpy.getAllProducts).toHaveBeenCalled();
      expect(component.products).toEqual(mockProducts);
    });

    it('deve logar erro se falhar ao carregar produtos', () => {
      spyOn(console, 'error');
      productServiceSpy.getAllProducts.and.returnValue(
        throwError(() => new Error('Falha ao carregar'))
      );

      component.loadProducts();

      expect(productServiceSpy.getAllProducts).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Erro ao carregar produtos:', new Error('Falha ao carregar'));
      expect(component.products.length).toBe(0);
    });
  });

  describe('#paginatedProducts', () => {
    it('deve retornar um slice do array de acordo com page e pageSize', () => {
      component.products = [
        { id: 1, name: 'Prod1', price: 10 },
        { id: 2, name: 'Prod2', price: 20 },
        { id: 3, name: 'Prod3', price: 30 },
        { id: 4, name: 'Prod4', price: 40 },
      ];
      component.page = 2;
      component.pageSize = 2;

      const result = component.paginatedProducts();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(4);
    });
  });

  describe('#onPageChange', () => {
    it('deve atualizar o número da página', () => {
      component.page = 1;
      component.onPageChange(3);
      expect(component.page).toBe(3);
    });
  });
});
