import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  isRegister = false; // 判斷是否顯示註冊頁面
  authForm: FormGroup; // Reactive Form
  errorMessage = ''; // 錯誤訊息

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginPageComponent>,
    public dialog: MatDialog,
  ) {
    // 初始化表單
    this.authForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rePassword: [''], // 只有註冊頁面需要
        displayName: [''], // 只有註冊頁面需要
      },
      {
        validators: [this.passwordMatchValidator, this.displayNameRequiredValidator.bind(this)], // 自訂驗證器
      }
    );
  }

  // 自訂驗證器：檢查密碼是否一致
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;
    if (password && rePassword && password !== rePassword) {
      return { passwordsMismatch: true };
    }
    return null;
  }

  displayNameRequiredValidator(group: AbstractControl): ValidationErrors | null {
    const isRegister = this.isRegister; // 使用目前的 isRegister 狀態
    const displayName = group.get('displayName')?.value;

    if (isRegister && (!displayName || displayName.trim() === '')) {
      return { displayNameRequired: true };
    }
    return null;
  }


  // 提交表單
  submitForm() {
    if (this.authForm.invalid) {
      this.markFormGroupTouched(this.authForm);
      // this.errorMessage = '請確認以下欄位：\n' + this.collectErrors(this.authForm);
      return;
    }

    if (this.isRegister) {
      this.register();
    } else {
      this.login();
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  private collectErrors(formGroup: FormGroup): string {
    const errors: string[] = [];
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.errors) {
        if (control.errors['required']) {
          errors.push(`${this.getFieldDisplayName(key)} 為必填`);
        }
        if (control.errors['email']) {
          errors.push(`${this.getFieldDisplayName(key)} 格式不正確`);
        }
        if (control.errors['minlength']) {
          errors.push(
            `${this.getFieldDisplayName(key)} 至少需要 ${control.errors['minlength'].requiredLength} 個字元`
          );
        }
      }
    });

    if (formGroup.errors?.['passwordsMismatch']) {
      errors.push('密碼與確認密碼不一致');
    }

    return errors.join('\n');
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'Email',
      password: '密碼',
      rePassword: '確認密碼',
      displayName: '暱稱',
    };
    return fieldNames[field] || field;
  }

  // 登入邏輯
  login() {
    const { email, password } = this.authForm.value;
    this.authService
      .login(email, password)
      .then(userCredential => {
        const user = userCredential.user;


        // 檢查信箱是否已驗證
        if (user && !user.emailVerified) {
          this.errorMessage = '您的信箱尚未驗證，請先至信箱點擊驗證連結後再重新登入。';
          return;
        }

        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '300px', // 設定對話框的寬度
          data: {
            title: "登入成功",
            message: `${user.displayName}～歡迎回來喵`,
            imgPath: "assets/S__222224406.jpg"
          }
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.close(true);
        });
      })
      .catch(error => {
        // 處理錯誤代碼
        switch (error.code) {
          case 'auth/invalid-credential':
            this.errorMessage = '帳號不存在或密碼錯誤，請再試一次。';
            break;
          default:
            this.errorMessage = '因不明原因登入失敗，請稍後再試。';
            break;
        }

        console.error(error.message);
      });
  }


  // 註冊邏輯
  register() {
    const { email, password, displayName } = this.authForm.value;
    this.authService
      .register(email, password, displayName)
      .then(() => {
        this.errorMessage = '註冊成功，請至您的信箱確認後重新登入';
        this.authForm.reset();
        this.isRegister = false; // 切回登入頁面
      })
      .catch(error => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            this.errorMessage = '帳號已存在，請使用Google或直接登入';
            break;
          default:
            this.errorMessage = '因不明原因註冊失敗，請稍後再試。';
            break;
        }
      });
  }

  resendVerificationEmail() {
    const { email, password } = this.authForm.value;
    this.authService
      .login(email, password)
      .then(userCredential => {
        const user = userCredential.user;


        if (user) {
          this.authService.sendVerificationEmail(user);
          this.errorMessage = '驗證信已重新寄送，請檢查您的電子郵件並重新登入';
          return;
        }
      })
      .catch(error => {
        console.error(error.message);
        this.errorMessage = '重新寄送驗證信失敗，請稍後再試。';
      });
  }


  // Google 登入邏輯
  loginWithGoogle() {
    this.authService
      .loginWithGoogle()
      .then((userCredential) => {
        const user = userCredential.user;
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '300px', // 設定對話框的寬度
          data: {
            title: "登入成功",
            message: `${user.displayName}～歡迎回來喵`,
            imgPath: "assets/S__222224406.jpg"
          }
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.close(true);
        });
      })
      .catch(error => {
        console.error(error.message);
        this.errorMessage = "Google登入失敗，請重新再試";
      });
  }

  // 關閉對話框
  close(data: boolean) {
    this.dialogRef.close(data);
  }

  // 快速存取表單控制項
  get f() {
    return this.authForm.controls;
  }

  forgotPassword() {
    const { email } = this.authForm.value;

    if (!email) {
      this.errorMessage = '請輸入帳號使用的電子郵件地址';
      return;
    }

    this.authService.forgotPassword(email)
      .then(() => {
        this.errorMessage = '重設密碼的郵件已發送，請檢查您的信箱';
      })
      .catch(error => {
        console.error('重設密碼錯誤', error.message);
        this.errorMessage = '發送重設密碼郵件時出錯，請稍後再試。';
      });
  }
}
