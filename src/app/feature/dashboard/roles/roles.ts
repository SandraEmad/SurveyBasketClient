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
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { IRole } from '../../../core/models/Roles/irole';
import { RolesService } from '../../../core/services/Roles/rolesService';
import { form, FormField, required, validate } from '@angular/forms/signals';

interface IPermissionGroup {
  resource: string;
  actions: string[];
}

const FIXED_ACTIONS = ['get', 'create', 'update', 'delete'];

@Component({
  selector: 'app-roles',
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
    TranslatePipe,FormField
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class Roles {
  private rolesService = inject(RolesService);
  private subscription = new Subscription();
  private translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<IRole>([]);
  displayedColumns = ['series', 'name', 'isDeleted'];

  isLoading = false;
  showEntryForm = signal(false);
  isEditMode = signal(false);
  editRoleId = signal('');
  allRoles: IRole[] = [];
  direction = signal(false);

  fixedActions = FIXED_ACTIONS;
  newResourceName = signal('');
  permissionGroups = signal<IPermissionGroup[]>([]);

  roleModel = signal({
    name: '',
    permissions: [] as string[],
  });

roleForm = form(this.roleModel, (schema) => {
  required(schema.name, { message: 'Role name is required.' });

  validate(schema.permissions, ({ value }) =>
    value().length === 0
      ? { kind: 'permissionsRequired', message: 'You must put the permissions.' }
      : null
  );
});
  addResourceGroup(): void {
    const name = this.newResourceName().trim().toLowerCase();
    if (!name) return;
    if (this.permissionGroups().some((g) => g.resource === name)) {
      this.toastr.warning('This resource is already added.');
      return;
    }
    this.permissionGroups.update((groups) => [...groups, { resource: name, actions: [] }]);
    this.newResourceName.set('');
  }

  removeResourceGroup(resource: string): void {
    this.permissionGroups.update((groups) => groups.filter((g) => g.resource !== resource));
    this.syncPermissionsToModel();
  }

  toggleAction(resource: string, action: string): void {
    this.permissionGroups.update((groups) =>
      groups.map((g) =>
        g.resource === resource
          ? {
              ...g,
              actions: g.actions.includes(action)
                ? g.actions.filter((a) => a !== action)
                : [...g.actions, action],
            }
          : g
      )
    );
    this.syncPermissionsToModel();
  }

  private syncPermissionsToModel(): void {
    const flat = this.permissionGroups().flatMap((g) => g.actions.map((a) => `${g.resource}:${a}`));
    this.roleModel.update((m) => ({ ...m, permissions: flat }));
    this.roleForm.permissions().markAsTouched();
  }

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
    this.getAllRoles();
  }

  refreshTable() {
    this.dataSource = new MatTableDataSource<IRole>(this.allRoles);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAllRoles(): void {
    this.isLoading = true;
    this.rolesService.GetAllRoles().subscribe({
      next: (res) => {
        if (res.status == 200) {
          this.allRoles = res.data;
          this.refreshTable();
          this.toastr.success(res?.messages?.[0]?.text ?? 'Roles loaded successfully.');
        }
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this.isEditMode.set(false);
    this.editRoleId.set('');
    this.roleModel.set({ name: '', permissions: [] });
    this.permissionGroups.set([]);
    this.newResourceName.set('');
    this.showEntryForm.set(true);
  }

  openDialogEdit(row: IRole): void {
    this.isEditMode.set(true);
    this.editRoleId.set(row.id!);
    this.showEntryForm.set(true);
    this.isLoading = true;

    this.rolesService.GetPermissionsForRole(row.id!).subscribe({
      next: (res) => {
        if (res.status == 200) {
          this.roleModel.set({
            name: res.data.name ?? '',
            permissions: res.data.permissions ?? [],
          });

          const map = new Map<string, string[]>();
          (res.data.permissions ?? []).forEach((p: string) => {
            const [resource, action] = p.split(':');
            map.set(resource, [...(map.get(resource) ?? []), action]);
          });
          this.permissionGroups.set(
            Array.from(map.entries()).map(([resource, actions]) => ({ resource, actions }))
          );
        }
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  closeDialog(): void {
    this.showEntryForm.set(false);
    this.roleModel.set({ name: '', permissions: [] });
    this.permissionGroups.set([]);
  }

  doSave(): void {
    if (this.roleForm().invalid()) return;

    const payload: IRole = {
      name: this.roleModel().name,
      permissions: this.roleModel().permissions,
    };

    if (!this.isEditMode()) {
      this.rolesService.CreateRole(payload).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ?? 'Role created successfully.');
          this.getAllRoles();
          this.closeDialog();
        },
        error: () => (this.isLoading = false),
      });
    } else {
      this.rolesService.UpdateRole(this.editRoleId(), payload).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ?? 'Role updated successfully.');
          this.getAllRoles();
          this.closeDialog();
        },
        error: () => (this.isLoading = false),
      });
    }
  }

  toggleStatus(role: IRole): void {
    Swal.fire({
      title: this.translate.instant('global.confirmToggleTitle'),
      text: this.translate.instant(
        role.isDeleted ? 'roles.confirmActivateText' : 'roles.confirmDeactivateText'
      ),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#67b0ff',
      cancelButtonColor: '#d32f2f',
      confirmButtonText: this.translate.instant('global.confirmBtn'),
      cancelButtonText: this.translate.instant('global.cancel'),
      reverseButtons: this.direction(),
    }).then((result) => {
      if (result.isConfirmed) {
        this.rolesService.ToggleRole(role.id!).subscribe({
          next: (res) => {
            role.isDeleted = !role.isDeleted;
            this.refreshTable();
            this.toastr.success(res?.messages?.[0]?.text ?? 'Status updated.');
          },
          error: () => this.toastr.error('Failed to update status.'),
        });
      }
    });
  }
}
