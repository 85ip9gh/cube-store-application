import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: 'home',
    loadChildren: () => import('./pages/components/modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./pages/components/modules/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/components/modules/login/login.module').then(m => m.LoginModule)
  }
  ,
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  }];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
