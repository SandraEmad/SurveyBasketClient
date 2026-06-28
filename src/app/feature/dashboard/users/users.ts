import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
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
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    FormField, //
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private userService = inject(User);
  private subscription = new Subscription();
  private translate = inject(TranslateService);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<IUser>([]);
  displayedColumns = [
    'photo',
    'firstName',
    'lastName',
    'email',
    'isActive',
    'isLocked',
    'actionsBtn',
  ];

  isLoading = false;
  showEntryForm = signal(false);
  isEditMode: string = '';
  editUserId: string = '';
  allUsers: IUser[] = [];
  direction = signal(false); // false = ltr, true = rtl

  // Signal Form
  userModel = signal({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  userForm = form(this.userModel, (schema) => {
    required(schema.firstName, { message: 'First name is required.' });
    minLength(schema.firstName, 3, { message: 'First name must be between 3 and 100 characters.' });
    maxLength(schema.firstName, 100, {
      message: 'First name must be between 3 and 100 characters.',
    });

    required(schema.lastName, { message: 'Last name is required.' });
    minLength(schema.lastName, 3, { message: 'Last name must be between 3 and 100 characters.' });
    maxLength(schema.lastName, 100, { message: 'Last name must be between 3 and 100 characters.' });

    required(schema.email, { message: 'Email is required.' });
    email(schema.email, { message: 'Please enter a valid email.' });

    required(schema.password, { message: 'Password is required.' });
    pattern(schema.password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
      message:
        'Password should be at least 8 characters and contain lowercase, uppercase, digit, and special character.',
    });
  });

  ngOnInit(): void {
    this.loadUsers();

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
  }

  refreshTable() {
    this.dataSource = new MatTableDataSource<IUser>(this.allUsers);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.dataSource.data = [
      {
        id: '1',
        firstName: 'Sandra',
        lastName: 'Emad',
        email: 'sandra@example.com',
        isActive: true,
        isLocked: false,
      },
      {
        id: '2',
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        email: 'ahmed@example.com',
        isActive: false,
        isLocked: true,
      },
      {
        id: '3',
        firstName: 'Nour',
        lastName: 'Ali',
        email: 'nour@example.com',
        isActive: true,
        isLocked: true,
      },
      {
        id: '4',
        firstName: 'Omar',
        lastName: 'Khaled',
        email: 'omar@example.com',
        isActive: false,
        isLocked: false,
      },
      {
        id: '5',
        firstName: 'Mona',
        lastName: 'Hassan',
        email: 'mona@example.com',
        isActive: true,
        isLocked: false,
      },
    ];
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this.isEditMode = '';
    this.editUserId = '';
    this.userModel.set({ firstName: '', lastName: '', email: '', password: '' });
    this.showEntryForm.set(true);
  }

  openDialogEdit(row: IUser): void {
    this.isEditMode = 'edit';
    this.showEntryForm.set(true);
    this.isLoading = true;

    this.userService.getUserById(row.id!).subscribe({
      next: (res) => {
        this.userModel.set({
          firstName: res.data.firstName ?? '',
          lastName: res.data.lastName ?? '',
          email: res.data.email ?? '',
          password: '',
        });
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  closeDialog(): void {
    this.showEntryForm.set(false);
    this.userModel.set({ firstName: '', lastName: '', email: '', password: '' });
  }

  doSave(): void {
    if (this.userForm().invalid()) return;

    if (this.isEditMode === '') {
      this.userService.createUser(this.userModel()).subscribe({
        next: (res) => {
          this.refreshTable();
          this.closeDialog();
        },
        error: () => (this.isLoading = false),
      });
    } else {
      this.userService.updateUser(this.editUserId, this.userModel()).subscribe({
        next: (res) => {
          this.refreshTable();
          this.closeDialog();
        },
        error: () => (this.isLoading = false),
      });
    }
  }

  toggleStatus(user: IUser): void {
    this.userService.toggleStatus(user.id!).subscribe({
      next: () => (user.isActive = !user.isActive),
    });
  }

  unlock(user: IUser): void {
    this.userService.unlock(user.id!).subscribe({
      next: () => (user.isLocked = false),
    });
  }
}
