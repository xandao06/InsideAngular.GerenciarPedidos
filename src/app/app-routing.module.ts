import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './modules/order/order-list/order-list.component';
import { ProductListComponent } from './modules/product/product-list/product-list.component';

const routes: Routes = [
  { path: 'orders', component: OrderListComponent },
  { path: 'products', component: ProductListComponent },
  { path: '', redirectTo: '/orders', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
