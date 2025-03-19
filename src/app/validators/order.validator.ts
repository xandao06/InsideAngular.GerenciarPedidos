import { OrderProduct } from '../data/models/order-product.model';

export class OrderValidator {
  static validateCustomerName(customerName: string): void {
    if (!customerName || customerName.trim().length === 0) {
      throw new Error('É necessário preencher o nome antes de abrir o pedido');
    }
  }

  static validateProductsBeforeClosing(products: OrderProduct[]): void {
    if (!products || products.length === 0) {
      throw new Error('Adicione pelo menos um produto antes de fechar o pedido');
    }
  }
}
