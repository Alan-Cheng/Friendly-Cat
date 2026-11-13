import { StoreMapComponent } from './store-map/store-map.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 用於雙向綁定 [(ngModel)]
import { ReactiveFormsModule } from '@angular/forms';

// 导入 Angular Material 模块
import { MatFormFieldModule } from '@angular/material/form-field';  // 用于 form-field
import { MatSelectModule } from '@angular/material/select';  // 用于下拉選單
import { MatOptionModule } from '@angular/material/core';  // 用于 mat-option
import { MatInputModule } from '@angular/material/input';  // 用于 mat-label 和其他输入框功能
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // 用於 mat-autocomplete
import { MatButtonModule } from '@angular/material/button'; // 用於 mat-button
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';

import { RoundPipe } from '../pipes/round.pipe';
import { EmptyInfoPipe } from '../pipes/empty-info.pipe';

import { DisplayComponent } from './new-search/display/display.component';
import { NewSearchComponent } from './new-search/new-search.component';
import { SiderComponent } from '../components/sider/sider.component';

@NgModule({
  declarations: [
    DisplayComponent,
    NewSearchComponent,
    RoundPipe,
    EmptyInfoPipe,
    SiderComponent
  ],
  imports: [
    StoreMapComponent,
    CommonModule,
    FormsModule, // 支援 [(ngModel)]
    MatFormFieldModule,  // 新增
    MatSelectModule,     // 新增
    MatOptionModule,     // 新增
    MatInputModule,       // 新增
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatToolbarModule,
    MatDividerModule,
  ]
})
export class SearchFoodModule { }
