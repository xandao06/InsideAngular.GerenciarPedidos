import { OrderProduct } from "./order-product.model";
export interface Order {
  id: number;
  customerName: string;
  isClosed: boolean;
  products: OrderProduct[];
}


