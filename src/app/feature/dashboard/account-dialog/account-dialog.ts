import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Account } from '../../../core/services/account/account';
import { Subscription } from 'rxjs';
import { Field, form, required, minLength, maxLength, pattern, FormField } from '@angular/forms/signals';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-account-dialog',
  imports: [
    CommonModule,
    FormField,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    TranslatePipe,
    MatProgressSpinnerModule,],
  templateUrl: './account-dialog.html',
  styleUrl: './account-dialog.scss',
})
export class AccountDialog {
   private readonly accountService = inject(Account);
  private toastr = inject(ToastrService);
  private subscription = new Subscription();
  private translate = inject(TranslateService);
   private dialogRef = inject(MatDialogRef<AccountDialog>);
  isLoading = false;
  isSavingProfile = signal(false);
  isChangingPassword = signal(false);
  direction = signal(false);
  
  ngOnInit(): void {
    this.direction.set(this.translate.currentLang() === 'ar');
    const sub = this.translate.onLangChange.subscribe((event) => {
      this.direction.set(event.lang === 'ar');
    });
    this.subscription.add(sub);
     this.loadProfile();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // --- بيانات ريد أونلي ---
  email = signal('');
  userName = signal('');

  // --- فورم البروفايل ---
  profileModel = signal({
    firstName: '',
    lastName: '',
  });

  profileForm = form(this.profileModel, (schema) => {
    required(schema.firstName, { message: 'الاسم الأول مطلوب.' });
    minLength(schema.firstName, 3, { message: 'الاسم الأول لازم يكون بين 3 و 100 حرف.' });
    maxLength(schema.firstName, 100, { message: 'الاسم الأول لازم يكون بين 3 و 100 حرف.' });

    required(schema.lastName, { message: 'الاسم الأخير مطلوب.' });
    minLength(schema.lastName, 3, { message: 'الاسم الأخير لازم يكون بين 3 و 100 حرف.' });
    maxLength(schema.lastName, 100, { message: 'الاسم الأخير لازم يكون بين 3 و 100 حرف.' });
  });

  // --- فورم الباسورد ---
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  passwordModel = signal({
    currentPassword: '',
    newPassword: '',
  });

  passwordForm = form(this.passwordModel, (schema) => {
    required(schema.currentPassword, { message: 'كلمة السر الحالية مطلوبة.' });

    required(schema.newPassword, { message: 'كلمة السر الجديدة مطلوبة.' });
    pattern(schema.newPassword, this.passwordPattern, {
      message: 'لازم 8 حروف على الأقل، وتحتوي على حرف كبير وصغير ورقم ورمز خاص (@$!%*?&).',
    });
  });

  loadProfile(): void {
    this.isLoading = true;
    this.accountService.getProfileData().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.email.set(res.data.email);
          this.userName.set(res.data.userName);
          this.profileModel.set({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
          });
          this.toastr.success(res?.messages?.[0]?.text ?? 'Get Profile Data successfully.');
          this.isLoading = false;
        }
      },
      error: () => (this.isLoading = false),
    });
  }

  saveProfile(): void {
    if (this.profileForm().invalid()) return;
    this.isSavingProfile.set(true);
    this.accountService.UpdateProfile(this.profileModel()).subscribe({
      next: (res) => {
        if (res.status === 200) {
          (this.isSavingProfile.set(false),
            this.toastr.success(res?.messages?.[0]?.text ?? 'تم تحديث البيانات بنجاح.'));
          this.isLoading = false;
        }
      },
      error: () => this.isSavingProfile.set(false),
    });
  }

  submitChangePassword(): void {
    if (this.passwordForm().invalid()) return;
    this.isChangingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordModel();
    this.accountService.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.isChangingPassword.set(false);
          this.passwordModel.set({ currentPassword: '', newPassword: '' });
          this.passwordModel.set({
            currentPassword: res.data.currentPassword,
            newPassword: res.data.newPassword,
          });
          this.toastr.success(res?.messages?.[0]?.text ?? 'تم تغيير كلمة السر بنجاح.');
        }
      },
      error: () => this.isChangingPassword.set(false),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
