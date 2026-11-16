import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('sidebarWindow', { static: true }) sidebarWindow!: ElementRef<HTMLDialogElement>;
  @ViewChild('detailsWindow', { static: true }) detailsWindow!: ElementRef<HTMLDialogElement>;
  @Output() tutorialRequested = new EventEmitter<void>();
  @Input() worldMode = false;
  @Input() user: any;
  @Input() favoriteStores: any[] = [];

  @Output() userUpdated = new EventEmitter<any>();
  @Output() favoriteStoresUpdated = new EventEmitter<any>();
  @Output() searchStore = new EventEmitter<string>();
  @Output() foodSearchResult = new EventEmitter<any>();

  @Input() foodDetails711: any[] = [];
  @Input() foodDetailsFamilyMart: any[] = [];

  sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  familyMartIconUrl = environment.familyMartUrl.icon;
  
  // 側邊欄狀態
  sidebarOpen = false;
  sidebarClosing = false;
  tourMode = false;
  detailMode = false;

  openForTour(): void {
    const drawer = this.sidebarWindow.nativeElement;
    if (drawer.open) return;
    this.detailMode = false;
    this.tourMode = true;
    this.sidebarOpen = true;
    drawer.classList.add('tour-sidebar');
    // The tour owns focus and its overlay. A modal drawer would make the
    // tour controls outside it inert and cover them with the native top layer.
    drawer.show();
  }

  closeForTour(): void {
    if (!this.tourMode) return;
    this.sidebarWindow.nativeElement.close();
    this.sidebarWindow.nativeElement.classList.remove('tour-sidebar');
    this.tourMode = false;
    this.sidebarOpen = false;
  }
  
  constructor(private authService: AuthService, public dialog: MatDialog) {}

  openStoreDetails(): void {
    this.sidebarWindow.nativeElement.close();
    this.detailMode = true;
    this.sidebarOpen = true;
    const drawer = this.detailsWindow.nativeElement;
    if (!drawer.open) drawer.showModal();
  }

  showMenu(): void {
    this.detailsWindow.nativeElement.close();
    this.detailMode = false;
    this.sidebarOpen = true;
    const drawer = this.sidebarWindow.nativeElement;
    if (!drawer.open) drawer.showModal();
  }

  onPanelClosed(panel: HTMLDialogElement): void {
    // A close event can arrive after the other panel has already opened.
    if (panel.open) return;
    this.detailMode = this.detailsWindow.nativeElement.open;
    this.sidebarOpen = this.detailMode || this.sidebarWindow.nativeElement.open;
  }

  private outsidePointer = false;
  private touchStart?: { x: number; y: number; id: number };

  private isOutside(event: MouseEvent): boolean {
    const rect = (event.currentTarget as HTMLDialogElement).getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
  }

  onPanelPointerDown(event: PointerEvent): void { this.outsidePointer = this.isOutside(event); }
  // Coordinate fallback also covers browsers without dialog.closedBy (Safari).
  onPanelClick(event: MouseEvent): void {
    if (this.outsidePointer && this.isOutside(event)) void this.closeSidebar();
    this.outsidePointer = false;
  }

  cancelPanelTouch(): void { this.touchStart = undefined; }

  onPanelTouchStart(event: TouchEvent, details: boolean): void {
    this.touchStart = undefined;
    if (event.touches.length !== 1 || !window.matchMedia('(max-width: 600px)').matches) return;
    const target = event.target as HTMLElement;
    if (target === event.currentTarget || target.closest('input, textarea, select')) return;
    // A downward swipe dismisses only when the touched scroll area is at its top.
    if (details) {
      for (let node: HTMLElement | null = target; node && node !== event.currentTarget; node = node.parentElement) {
        if (node.scrollTop > 0) return;
      }
    }
    const touch = event.touches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY, id: touch.identifier };
  }

  onPanelTouchEnd(event: TouchEvent, details: boolean): void {
    const start = this.touchStart;
    this.touchStart = undefined;
    if (!start || event.touches.length) return;
    const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (details ? dy > 72 && dy > Math.abs(dx) * 1.5 : dx < -72 && -dx > Math.abs(dy) * 1.5) {
      void this.closeSidebar();
    }
  }

  toggleSidebar(): void {
    if (this.sidebarOpen) void this.closeSidebar();
    else this.showMenu();
  }

  // 關閉側邊欄
  async closeSidebar(): Promise<void> {
    const drawer = this.detailMode ? this.detailsWindow.nativeElement : this.sidebarWindow.nativeElement;
    if (!drawer.open || this.sidebarClosing) return;
    this.sidebarClosing = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const currentTransform = getComputedStyle(drawer).transform;
    const exitTransform = this.detailMode && window.matchMedia('(max-width: 600px)').matches ? 'translateY(100%)' : 'translateX(-100%)';
    drawer.getAnimations().forEach(animation => animation.cancel());
    const animation = drawer.animate(
      reducedMotion ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ transform: currentTransform }, { transform: exitTransform }],
      { duration: reducedMotion ? 100 : 200, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }
    );
    try { await animation.finished; } catch { /* Finish closing if the animation is interrupted. */ }
    finally {
      drawer.close();
      animation.cancel();
      this.sidebarOpen = false;
      this.sidebarClosing = false;
    }
  }

  onSidebarCancel(event: Event): void { event.preventDefault(); void this.closeSidebar(); }
  async openTutorial(): Promise<void> { await this.closeSidebar(); this.tutorialRequested.emit(); }
  async openAccount(): Promise<void> { await this.closeSidebar(); this.loginOrlogout(); }
  async openFoodResult(result: any): Promise<void> { await this.closeSidebar(); this.foodSearchResult.emit(result); }
  isSevenElevenFavorite(store: any): boolean {
    if (store.label) return store.label === '7-11';
    return !!store.store711Name || /^(?:7-ELEVEN|7-11|711)/i.test(store.storeName || '');
  }

  favoriteStoreName(store: any): string {
    return (store.storeName || '').replace(/^(?:全家(?:便利商店)?|FamilyMart|7-ELEVEN|7-11|711)\s*/i, '').trim();
  }

  async openFavoriteStore(store: any): Promise<void> {
    if (!this.worldMode) await this.closeSidebar();
    this.onSearchStore(store);
  }
  async openVersion(event: MouseEvent): Promise<void> {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const href = (event.currentTarget as HTMLAnchorElement).href;
    await this.closeSidebar();
    window.location.assign(href);
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
          imgPath: "assets/S__222224406.png"
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
