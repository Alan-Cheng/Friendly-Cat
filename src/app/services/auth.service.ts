import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, updateProfile, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { getDatabase, ref, get } from 'firebase/database';
import firebase from 'firebase/compat/app';  // Firebase
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map } from 'rxjs';
import { User } from 'firebase/auth';
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private afAuth: AngularFireAuth
  ) { }

  // 這裡返回的是 Observable，訂閱後能夠獲得用戶的狀態
  get user(): Observable<firebase.User | null> {
    return this.afAuth.authState;  // 這裡返回的是 Observable
  }

  // 使用電子郵件與密碼登入
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email: string, password: string, displayName: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then(userCredential => {
      const user = userCredential.user;
  
      if (user) {
        // 設定顯示名稱
        updateProfile(user, { displayName }).then(() => {
        });
  
        // 發送驗證信件
        sendEmailVerification(user).then(() => {
        });
  
        return user;
      }
  
      return Promise.reject('使用者註冊失敗');
    });
  }

  // Google OAuth2 Login
  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // 檢查是否已經登入
  isLoggedIn(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => user !== null)  // 用戶存在表示已登入
    );
  }

  // 獲取用戶資料
  getUser(): Observable<any> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(user);
      });
    });
  }

  logout(): void {
    this.afAuth.signOut();
  }

  getAuthState(): Observable<any>{
    return this.afAuth.authState;
  }

  getUserData(uid: string): Promise<any> {
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    return get(userRef).then((snapshot) => snapshot.val());
  }

  sendVerificationEmail(user: User) {
    return sendEmailVerification(user);
  }

  resendVerificationEmail(email: string) {
    const auth = getAuth(); // 使用原生的 Firebase Auth
    return fetchSignInMethodsForEmail(auth, email).then(methods => {
      if (methods.includes('password')) {
        const user = auth.currentUser;
        if (user) {
          return sendEmailVerification(user);
        } else {
          return Promise.reject(new Error('請先登入以寄送驗證信。'));
        }
      } else {
        return Promise.reject(new Error('此電子郵件未註冊。'));
      }
    });
  }  

  // 發送重設密碼的電子郵件
  forgotPassword(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email)
      .then(() => {
        // 成功後的操作
      })
      .catch(error => {
        // 失敗後的錯誤處理
        console.error('重設密碼郵件發送失敗', error);
        throw error;
      });
  }
}
