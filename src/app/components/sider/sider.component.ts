import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoginPageComponent } from 'src/app/components/login-page/login-page.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.scss'],
})
export class SiderComponent {
  @Input() user: any;
  @Input() favoriteStores: any[] = [];

  @Output() userUpdated = new EventEmitter<any>();
  @Output() favoriteStoresUpdated = new EventEmitter<any>();
  @Output() searchStore = new EventEmitter<string>();

  sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  familyMartIconUrl = environment.familyMartUrl.icon;
  
  // 側邊欄狀態
  sidebarOpen = false;

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
  ) { }

  // 切換側邊欄
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // 關閉側邊欄
  closeSidebar() {
    this.sidebarOpen = false;
  }

  loginOrlogout() {
    if (this.user) {
      this.authService.logout();
      this.user = null;
      this.favoriteStores = []; // 清空這裡的東西
      this.userUpdated.emit(null);
      this.favoriteStoresUpdated.emit([]);
      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: '300px', // 設定對話框的寬度
        data: {
          title: "登出成功",
          message: `已順利登出`,
          imgPath: "assets/S__222224406.jpg"
        }
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.favoriteStores = []; // 清空這裡的東西
      });
    } else {
      const dialogRef = this.dialog.open(LoginPageComponent, {
        width: '500px', // 設定對話框的寬度
        data: {},
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.authService.getUser().subscribe((user) => {
            if (user && user.emailVerified) {
              this.user = user;
              this.userUpdated.emit(user); // 通知父組件用戶已登錄
            }
          });
        }
      });
    }
  }

  onSearchStore(store: any) {
    this.searchStore.emit(store);
  }
}
