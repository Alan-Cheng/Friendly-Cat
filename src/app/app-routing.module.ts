import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NewSearchComponent } from './search-food/new-search/new-search.component';

const routes: Routes = [
  { path: 'classic', loadChildren: () => import('./search-food/legacy-search.module').then(m => m.LegacySearchModule) },
  { path: '**', component: NewSearchComponent },  // 所有其他路径都重定向到 /search
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
