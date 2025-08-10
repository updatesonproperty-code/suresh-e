
import { type Product } from "./products";

export type OrderItem = {
  product: Product;
  quantity: number;
};

export type Slip = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  invoiceContent: string;
  staffName: string;
};
