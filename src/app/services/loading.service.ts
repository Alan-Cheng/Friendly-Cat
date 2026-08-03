import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('');
  private normalLoading = false;
  private normalMessage = '';
  private verificationLoading = false;

  // 載入狀態
  public loading$ = this.loadingSubject.asObservable();

  // 顯示訊息
  public message$ = this.messageSubject.asObservable();

  // 顯示載入狀態和訊息
  show(message: string): void {
    this.normalLoading = true;
    this.normalMessage = message;

    if (!this.verificationLoading) {
      this.loadingSubject.next(true);
      this.messageSubject.next(message);
    }
  }

  // 隱藏載入狀態並清除訊息
  hide(): void {
    this.normalLoading = false;
    this.normalMessage = '';

    if (!this.verificationLoading) {
      this.loadingSubject.next(false);
      this.messageSubject.next('');
    }
  }

  showVerification(message: string): void {
    this.verificationLoading = true;
    this.loadingSubject.next(true);
    this.messageSubject.next(message);
  }

  hideVerification(): void {
    this.verificationLoading = false;
    this.loadingSubject.next(this.normalLoading);
    this.messageSubject.next(this.normalLoading ? this.normalMessage : '');
  }
}
