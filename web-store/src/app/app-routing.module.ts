import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  { 
    path: 'home', 
    loadChildren: () => import('./pages/home/components/modules/home/home.module').then(m => m.HomeModule) 
  },
  { 
    path: 'cart', 
    loadChildren: () => import('./pages/home/components/modules/cart/cart.module').then(m => m.CartModule) 
  },
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  }];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
