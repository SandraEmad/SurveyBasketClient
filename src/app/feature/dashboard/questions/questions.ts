// questions.ts
import { Component, inject, Input, OnInit } from '@angular/core';
import { Question } from '../../../core/services/question/question';
import { ToastrService } from 'ngx-toastr';
import { AnswerItem, IQuestion } from '../../../core/models/question/iquestion';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';

interface QuestionState extends IQuestion {
  isSaved: boolean;
  isExpanded: boolean;
}

interface AnswerState extends AnswerItem {}

@Component({
  selector: 'app-questions',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatTooltipModule,
    DragDropModule,
    TranslatePipe,
  ],
  templateUrl: './questions.html',
  styleUrl: './questions.scss',
})
export class Questions implements OnInit {
  private readonly questionService = inject(Question);
  private readonly toastr = inject(ToastrService);
  private translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  questions: QuestionState[] = [];
  isLoading = false;
  pollId:number=0;


  ngOnInit() {
     this.pollId = Number(this.route.snapshot.paramMap.get('pollId'));
    this.loadQuestions();
  }
  goBack() {
    this.router.navigate(['/dashboard/polls']);
  }

  loadQuestions() {
     const body = {
    pageNumber:1,
    pageSize:10,
    searchValue: 'Id',
    sortColumn: 'Id',
    sortDirection: 'asc'
  };
    this.isLoading = true;
    this.questionService.getAllQuestion(this.pollId,body).subscribe({
      next: (res) => {
        const items = res?.data?.items ?? [];
        this.questions = items.map((q: any) => ({
          id: q.id,
          content: q.content,
          answers: (q.answers ?? []).map((a: any) => ({
            id: a.id,
            content: typeof a === 'string' ? a : a.content
          })),
          isSaved: true,
          isExpanded: false
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load questions.');
      }
    });
  }

  // ── Questions ──────────────────────────────────────────

  addQuestion() {
    this.questions.push({
      content: '',
      answers: [{ content: '' }],
      isSaved: false,
      isExpanded: true
    });
  }

  removeQuestion(index: number) {
    const q = this.questions[index];

    if (!q.id) {
      this.questions.splice(index, 1);
      return;
    }
    this.questionService.toggleStatus(this.pollId, q.id).subscribe({
      next: () => {

        this.toastr.success('Question deactivated.');
      },
      error: () => this.toastr.error('Failed to deactivate question.')
    });
  }

  saveQuestion(index: number) {
    const q = this.questions[index];
    if (!q.content.trim()) {
      this.toastr.warning('Question content is required.');
      return;
    }
    if (q.answers.length === 0 || q.answers.some(a => !a.content.trim())) {
      this.toastr.warning('All answers must have content.');
      return;
    }

    const payload = {
      content: q.content,
      answers: q.answers.map(a => a.content)
    };

    if (q.id) {
      this.questionService.updateQuestion(this.pollId, q.id, payload).subscribe({
        next: () => {
          q.isSaved = true;
          this.toastr.success('Question updated.');
        },
        error: () => this.toastr.error('Failed to update question.')
      });
    } else {
      this.questionService.createQuestion(this.pollId, payload).subscribe({
        next: () => {
          q.isSaved = true;
          this.toastr.success('Question saved.');
          this.loadQuestions();
        },
        error: () => this.toastr.error('Failed to save question.')
      });
    }
  }

  toggleStatus(q: QuestionState) {
    if (!q.id) return;
    this.questionService.toggleStatus(this.pollId, q.id).subscribe({
      next: () => {
        this.toastr.success('Status updated.');
      },
      error: () => this.toastr.error('Failed to update status.')
    });
  }

  dropQuestion(event: CdkDragDrop<QuestionState[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  // ── Answers ────────────────────────────────────────────

  addAnswer(qIndex: number) {
    this.questions[qIndex].answers.push({ content: '' });
  }

  removeAnswer(qIndex: number, aIndex: number) {
    this.questions[qIndex].answers.splice(aIndex, 1);
  }

  dropAnswer(event: CdkDragDrop<AnswerItem[]>, qIndex: number) {
    moveItemInArray(this.questions[qIndex].answers, event.previousIndex, event.currentIndex);
  }
}
