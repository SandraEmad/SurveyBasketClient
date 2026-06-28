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
export class Questions {
  @Input() pollId!: number;

  private readonly questionService = inject(Question);
  private readonly toastr = inject(ToastrService);
  private translate = inject(TranslateService);


  // questions: IQuestion[] = [];
  questions: IQuestion[] = [
    {
      id: 1,
      content: 'What is your age?',
      answers: [
        { id: 1, text: '18-25' },
        { id: 2, text: '26-35' },
        { id: 3, text: '36-45' },
        { id: 4, text: '46+' }
      ],
      isActive: true,
      isSaved: true,
      isExpanded: false
    },
    {
      id: 2,
      content: 'How satisfied are you with our service?',
      answers: [
        { id: 1, text: 'Very Satisfied' },
        { id: 2, text: 'Satisfied' },
        { id: 3, text: 'Neutral' },
        { id: 4, text: 'Dissatisfied' }
      ],
      isActive: true,
      isSaved: true,
      isExpanded: false
    },
    {
      id: 3,
      content: 'Would you recommend us to a friend?',
      answers: [
        { id: 1, text: 'Definitely Yes' },
        { id: 2, text: 'Probably Yes' },
        { id: 3, text: 'Not Sure' },
        { id: 4, text: 'No' }
      ],
      isActive: false,
      isSaved: true,
      isExpanded: false
    }
  ];
  isLoading = false;

  ngOnInit() {
    // this.loadQuestions();
  }

  loadQuestions() {
    this.isLoading = true;
    this.questionService.getAllQuestion(this.pollId).subscribe({
      next: (res) => {
        this.questions = (res.items ?? res.data ?? []).map((q: any) => ({
          id: q.id,
          content: q.content,
          answers: (q.answers ?? []).map((a: any) => ({
            id: a.id,
            text: typeof a === 'string' ? a : a.content
          })),
          isActive: q.isActive,
          isSaved: true,
          isExpanded: false
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // ── Questions ──────────────────────────────────────────

  addQuestion() {
    this.questions.push({
      content: '',
      answers: [{ text: '' }],
      isSaved: false,
      isExpanded: true
    });
  }

  removeQuestion(index: number) {
    const q = this.questions[index];
    if (q.id) {
      this.questionService.deleteQuestion(this.pollId, q.id).subscribe({
        next: () => {
          this.questions.splice(index, 1);
          this.toastr.success('Question deleted.');
        },
        error: () => this.toastr.error('Failed to delete question.')
      });
    } else {
      this.questions.splice(index, 1);
    }
  }

  saveQuestion(index: number) {
    const q = this.questions[index];
    if (!q.content.trim()) {
      this.toastr.warning('Question content is required.');
      return;
    }
    if (q.answers.length === 0 || q.answers.some(a => !a.text.trim())) {
      this.toastr.warning('All answers must have content.');
      return;
    }

    const payload = {
      content: q.content,
      answers: q.answers.map(a => a.text)
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
        next: (res) => {
          q.id = res.id;
          q.isSaved = true;
          this.toastr.success('Question saved.');
        },
        error: () => this.toastr.error('Failed to save question.')
      });
    }
  }

  dropQuestion(event: CdkDragDrop<[IQuestion]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
  }

  // ── Answers ────────────────────────────────────────────

  addAnswer(qIndex: number) {
    this.questions[qIndex].answers.push({ text: '' });
  }

  removeAnswer(qIndex: number, aIndex: number) {
    this.questions[qIndex].answers.splice(aIndex, 1);
  }

  dropAnswer(event: CdkDragDrop<AnswerItem[]>, qIndex: number) {
    moveItemInArray(this.questions[qIndex].answers, event.previousIndex, event.currentIndex);
  }

  toggleStatus(q: IQuestion) {
    if (!q.id) return;
    this.questionService.toggleStatus(this.pollId, q.id).subscribe({
      next: () => {
        q.isActive = !q.isActive;
        this.toastr.success('Status updated.');
      },
      error: () => this.toastr.error('Failed to toggle status.')
    });
  }
}
