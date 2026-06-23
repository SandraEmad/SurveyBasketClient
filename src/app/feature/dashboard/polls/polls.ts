import { Component, inject, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Poll } from '../../../core/services/poll/poll';
import { IPoll } from '../../../core/models/polls/Ipoll';

@Component({
  selector: 'app-polls',
  imports: [CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTooltipModule,
    TranslatePipe],
  templateUrl: './polls.html',
  styleUrl: './polls.scss',
})
export class Polls implements OnInit, OnDestroy{
  private readonly pollService = inject(Poll);
  private readonly toastr = inject(ToastrService);
  private subscription = new Subscription();
  masterRecord: IPoll = {} as IPoll;
  allPolls: IPoll[] = [];


  isEditMode: string = "";

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<IPoll>([]);
  displayedColumns = ['id', 'title', 'summary', 'isPublished', 'startsAt', 'endsAt', 'actionsBtn'];

  showEntryForm = signal(false);
  activeMask = signal(false);
  direction = signal(false); // false = ltr, true = rtl

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  openDialog() {
    this.isEditMode='';
    this.showEntryForm.set(true);
    this.masterRecord = {} as IPoll;
  }
  ngOnInit(){
    this.loadAllPolls();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  refreshTable() {
    this.dataSource = new MatTableDataSource<IPoll>(this.allPolls);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  loadAllPolls() {
    this.subscription.add(
      this.pollService.getAllPoll().subscribe({
        next: (res) => {
          if (res.status == 200){
            this.allPolls = res.data;
            this.refreshTable();
          }

        },
        error: () => {
          this.toastr.error('Failed to load polls');
          this.activeMask.set(false);
        }
      })
    );

  }

  openDialogEdit(row: IPoll) {
    this.showEntryForm.set(true);

  }
  deleteTransaction(row: IPoll) {

  }
  closeDialog() {
    this.showEntryForm.set(false);
  }
  doSave() {

  }
  doClear() {

  }
}
