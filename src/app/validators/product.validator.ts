import { Order } from "../data/models/order.model";

export class ProductValidator {

  static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('É necessário preencher o nome do produto antes de criar');
    }
    if (name.length > 50) {
      throw new Error('O nome do produto não pode ter mais que 50 caracteres');
    }
  }

  static validatePrice(price: number | null | undefined): void {
    if (price == null || isNaN(price) || price <= 0) {
      throw new Error('O preço do produto não pode ser 0');
    }
  }

  static validateProductInUse(productId: number, orders: Order[]): void {
    const isInUse = orders.some((order) =>
      order.products?.some((op) => op.productId === productId)
    );
    if (isInUse) {
      throw new Error('Não é possível deletar o produto pois ele está em uso em um pedido.');
    }
  }
}
