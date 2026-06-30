import { Component, inject, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Poll } from '../../../core/services/poll/poll';
import { IPoll } from '../../../core/models/polls/Ipoll';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import Swal from 'sweetalert2';
import {
  form, FormField,
  required, minLength, maxLength, validate
} from '@angular/forms/signals';
import { Questions } from "../questions/questions";

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTooltipModule,
    TranslatePipe,
    FormField,
    MatDatepickerModule,
    MatNativeDateModule,
    Questions
  ],
  providers: [DatePipe],
  templateUrl: './polls.html',
  styleUrl: './polls.scss',
})
export class Polls implements OnInit, OnDestroy {
  private readonly pollService = inject(Poll);
  private readonly toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  private subscription = new Subscription();
  public datePipe = inject(DatePipe);

  allPolls: IPoll[] = [];
  // allPolls: any[] = [
  //   {
  //     id: 1,
  //     title: 'Customer Satisfaction Survey',
  //     summary: 'Survey about our service quality',
  //     isPublished: true,
  //     startsAt: '2026-01-01',
  //     endsAt: '2026-12-31'
  //   },
  //   {
  //     id: 2,
  //     title: 'Employee Feedback Survey',
  //     summary: 'Annual employee engagement survey',
  //     isPublished: false,
  //     startsAt: '2026-03-01',
  //     endsAt: '2026-06-30'
  //   },
  //   {
  //     id: 3,
  //     title: 'Product Experience Survey',
  //     summary: 'Feedback on our new product line',
  //     isPublished: true,
  //     startsAt: '2026-02-15',
  //     endsAt: '2026-05-15'
  //   }
  // ];
  isEditMode: string = '';
  editPollId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<IPoll>([]);
  displayedColumns = ['index', 'title', 'summary', 'isPublished', 'startsAt', 'endsAt', 'actionsBtn'];

  showEntryForm = signal(false);
  activeMask = signal(false);
  direction = signal(false);

  // Signal Form
  pollModel = signal({
    title: '',
    summary: '',
    startsAt: '',
    endsAt: '',
  });

  pollForm = form(this.pollModel, (schema) => {
    required(schema.title, { message: 'Title is required.' });
    minLength(schema.title, 3, { message: 'Title must be between 3 and 100 characters.' });
    maxLength(schema.title, 100, { message: 'Title must be between 3 and 100 characters.' });

    required(schema.summary, { message: 'Summary is required.' });
    minLength(schema.summary, 10, { message: 'Summary must be between 10 and 1500 characters.' });
    maxLength(schema.summary, 1500, { message: 'Summary must be between 10 and 1500 characters.' });

    required(schema.startsAt, { message: 'StartsAt is required.' });
    validate(schema.startsAt, ({ value }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(value());
      if (start < today) return [{ kind: 'minDate', message: 'Start date must be today or later.' }];
      return undefined;
    });

    required(schema.endsAt, { message: 'EndsAt is required.' });
    validate(schema.endsAt, ({ value, valueOf }) => {
      const startsAt = valueOf(schema.startsAt);
      if (value() && startsAt && new Date(value()) < new Date(startsAt)) {
        return [{ kind: 'minDate', message: 'EndsAt must be greater than or equals start date.' }];
      }
      return undefined;
    });
  });

  ngOnInit() {
    this.direction.set(this.translate.currentLang() === 'ar');
    const sub = this.translate.onLangChange.subscribe((event) => {
      this.direction.set(event.lang === 'ar');
    });
    this.subscription.add(sub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.loadAllPolls();
  }

  refreshTable() {
    this.dataSource = new MatTableDataSource<IPoll>(this.allPolls);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  togglePublish(row: IPoll, event: Event) {
    event.stopPropagation();

    this.pollService.togglePublishStatus(row.id!).subscribe({
      next: (res) => {
        row.isPublished = res.data?.isPublished ?? !row.isPublished;
        this.refreshTable();
        this.toastr.success(res?.messages?.[0]?.text ?? 'Poll status updated.');
      },
      error: () => this.toastr.error('Failed to update status.')
    });
  }
  openDialog() {
    this.isEditMode = '';
    this.editPollId = null;
    this.pollModel.set({
      title: '',
      summary: '',
      startsAt: this.datePipe.transform(new Date(), 'yyyy-MM-dd')!,
      endsAt: ''
    });
    this.showEntryForm.set(true);
  }

  openDialogEdit(row: IPoll) {
    this.isEditMode = 'edit';
    this.editPollId = row.id!;
    this.showEntryForm.set(true);

    this.pollService.getPollById(row.id!).subscribe({
      next: (res) => {
        if (res.status == 200) {
          this.pollModel.set({
            title: res.data.title ?? '',
            summary: res.data.summary ?? '',
            startsAt: res.data.startsAt ?? '',
            endsAt: res.data.endsAt ?? '',
          });
        }

      }
    });
  }

  closeDialog() {
    this.showEntryForm.set(false);
    this.pollModel.set({ title: '', summary: '', startsAt: '', endsAt: '' });
  }

  doClear() {
    this.pollModel.set({ title: '', summary: '', startsAt: '', endsAt: '' });
  }

  showQuestionsSection = false;
  currentPollId: number | null = null;

  doSave() {
    if (this.pollForm().invalid()) return;

    const raw = this.pollModel();
    console.log(raw);
    const payload: IPoll = {
      ...raw,
      startsAt: this.datePipe.transform(raw.startsAt, 'yyyy-MM-dd')!,
      endsAt: this.datePipe.transform(raw.endsAt, 'yyyy-MM-dd')!,
    };
    console.log(payload);

    if (this.isEditMode === '') {
      this.pollService.createPoll(payload).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ?? 'Poll created successfully.');
          this.currentPollId = res.id; // ← مسك الـ id
          this.showQuestionsSection = true; // ← افتح قسم الأسئلة
        },
        error: () => this.toastr.error('Failed to create poll.')
      });
    } else {
      this.pollService.updatePoll(this.editPollId!, payload).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ??'Poll updated successfully.');
          this.loadAllPolls();
          this.closeDialog();
        },
        error: () => this.toastr.error('Failed to update poll.')
      });
    }
  }

deleteTransaction(row: IPoll) {
  Swal.fire({
    title: this.translate.instant('global.confirmDeleteTitle'),
    text: this.translate.instant('global.confirmDeleteText'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d32f2f',
    cancelButtonColor: '#67b0ff',
    confirmButtonText: this.translate.instant('global.confirmDeleteBtn'),
    cancelButtonText: this.translate.instant('global.cancel'),
    reverseButtons: this.direction(), // يقلب أماكن الأزرار لو RTL
  }).then((result) => {
    if (result.isConfirmed) {
      this.pollService.deletePoll(row.id!).subscribe({
        next: (res) => {
          this.toastr.success(res?.messages?.[0]?.text ?? 'Poll deleted successfully.');
          this.allPolls = this.allPolls.filter(p => p.id !== row.id);
          this.refreshTable();
        },
        error: () => this.toastr.error('Failed to delete poll.')
      });
    }
  });
}
  loadAllPolls() {
    this.subscription.add(
      this.pollService.getAllPoll().subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.allPolls = res.data;
            this.refreshTable();
            this.toastr.success(res?.messages?.[0]?.text ?? 'Polls loaded successfully.');
          }
        },
        error: () => this.activeMask.set(false)
      })
    );
  }
}
