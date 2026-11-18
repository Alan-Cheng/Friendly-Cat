import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NewSearchComponent } from './search-food/new-search/new-search.component';
import { storeViewGuard } from './search-food/new-search/store-link';

const routes: Routes = [
  { path: 'classic', canActivate: [storeViewGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', loadChildren: () => import('./search-food/legacy-search.module').then(m => m.LegacySearchModule) },
  { path: '**', canActivate: [storeViewGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', component: NewSearchComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
