import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { IUser } from '../../../core/models/users/iuser';
import { User } from '../../../core/services/users/user';
import {
  form,
  FormField,
  required,
  email,
  minLength,
  maxLength,
  pattern,
} from '@angular/forms/signals';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    FormField,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private userService = inject(User);
  private subscription = new Subscription();
  private translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<IUser>([]);
  displayedColumns = ['firstName', 'lastName', 'email', 'roles', 'isDisabled', 'actionsBtn'];

  isLoading = false;
  showEntryForm = signal(false);
  isEditMode: string = '';
  editUserId: string = '';
  allUsers: IUser[] = [];
  direction = signal(false);

  availableRoles = ['Admin', 'User']; // عدّليها حسب الـ roles الفعلية عندك في الـ backend

  userModel = signal({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roles: [] as string[],
  });

  userForm = form(this.userModel, (schema) => {
    required(schema.firstName, { message: 'First name is required.' });
    minLength(schema.firstName, 3, { message: 'First name must be between 3 and 100 characters.' });
    maxLength(schema.firstName, 100, { message: 'First name must be between 3 and 100 characters.' });

    required(schema.lastName, { message: 'Last name is required.' });
    minLength(schema.lastName, 3, { message: 'Last name must be between 3 and 100 characters.' });
    maxLength(schema.lastName, 100, { message: 'Last name must be between 3 and 100 characters.' });

    required(schema.email, { message: 'Email is required.' });
    email(schema.email, { message: 'Please enter a valid email.' });

    pattern(schema.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
      message: 'Password should be at least 8 characters and contain lowercase, uppercase, digit, and special character.',
    });
  });

  ngOnInit(): void {
    this.direction.set(this.translate.currentLang() === 'ar');
    const sub = this.translate.onLangChange.subscribe((event) => {
      this.direction.set(event.lang === 'ar');
    });
    this.subscription.add(sub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loadUsers();
  }

  refreshTable() {
    this.dataSource = new MatTableDataSource<IUser>(this.allUsers);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUser().subscribe({
      next: (res) => {
        if (res.status == 200) {
          this.allUsers = res.data;
          this.refreshTable();
           this.toastr.success(res?.messages?.[0]?.text ?? 'Poll created successfully.');
          this.isLoading = false;
        }

      },
      error: () => (this.isLoading = false),
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleRole(role: string) {
    const current = this.userModel().roles;
    const updated = current.includes(role)
      ? current.filter(r => r !== role)
      : [...current, role];
    this.userModel.update(m => ({ ...m, roles: updated }));
  }

  openDialog(): void {
    this.isEditMode = '';
    this.editUserId = '';
    this.userModel.set({ firstName: '', lastName: '', email: '', password: '', roles: ['Admin'] });
    this.showEntryForm.set(true);
  }

  openDialogEdit(row: IUser): void {
    this.isEditMode = 'edit';
    this.editUserId = row.id!;
    this.showEntryForm.set(true);
    this.isLoading = true;

    this.userService.getUserById(row.id!).subscribe({
      next: (res) => {
        if(res.status==200){
        this.userModel.set({
          firstName: res.data.firstName ?? '',
          lastName: res.data.lastName ?? '',
          email: res.data.email ?? '',
          password: '',
          roles: res.data.roles ?? [],
        });
       this.toastr.success(res?.messages?.[0]?.text ?? 'Get User successfully.');
        this.isLoading = false;
        }

      },
      error: () => (this.isLoading = false),
    });
  }

  closeDialog(): void {
    this.showEntryForm.set(false);
    this.userModel.set({ firstName: '', lastName: '', email: '', password: '', roles: [] });
  }

  doSave(): void {
    if (this.isEditMode === '') {
      if (this.userForm().invalid() || !this.userModel().password) return;

      this.userService.createUser(this.userModel()).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ?? 'User created successfully.');
          this.loadUsers();
          this.closeDialog();
        },
        error: () => (this.isLoading = false),
      });
    } else {

      this.userService.updateUser(this.editUserId, this.userModel()).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ?? 'User updated successfully.');
          this.loadUsers();
          this.closeDialog();
        },
        error: () => (this.isLoading = false),
      });
    }
  }

  toggleStatus(user: IUser): void {
    Swal.fire({
      title: this.translate.instant('global.confirmToggleTitle'),
      text: this.translate.instant(user.isDisabled ? 'users.confirmActivateText' : 'users.confirmDeactivateText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#67b0ff',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: this.translate.instant('global.confirmBtn'),
      cancelButtonText: this.translate.instant('global.cancel'),
      reverseButtons: this.direction(),
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.toggleStatus(user.id!,user).subscribe({
          next: (res) => {
            user.isDisabled = !user.isDisabled;
            this.refreshTable();
            this.toastr.success(res?.messages?.[0]?.text ?? 'Status updated.');
          },
          error: () => this.toastr.error('Failed to update status.'),
        });
      }
    });
  }
  unlock(user: IUser): void {
  Swal.fire({
    title: this.translate.instant('global.confirmUnlockTitle'),
    text: this.translate.instant('users.confirmUnlockText'),
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#67b0ff',
    cancelButtonColor: '#d32f2f',
    confirmButtonText: this.translate.instant('global.confirmBtn'),
    cancelButtonText: this.translate.instant('global.cancel'),
    reverseButtons: this.direction(),
  }).then((result) => {
    if (result.isConfirmed) {
      this.userService.unlock(user.id!,user).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ?? 'User unlocked successfully.');
          this.loadUsers();
        },
        error: () => this.toastr.error('Failed to unlock user.'),
      });
    }
  });
}
}
