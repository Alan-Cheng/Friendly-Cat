
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


import { LegacyDisplayComponent } from './new-search/display/legacy-display.component';
import { ImageDialogComponent } from './new-search/image-dialog/image-dialog.component';
import { LegacySearchComponent } from './new-search/legacy-search.component';
import { SearchFoodModule } from './search-food.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [LegacySearchComponent, LegacyDisplayComponent, ImageDialogComponent],
  imports: [
    SearchFoodModule,
    RouterModule.forChild([{ path: '', component: LegacySearchComponent }]),
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
export class LegacySearchModule { }
