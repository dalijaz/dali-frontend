// src/app/quiz/quiz.component.ts
import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder
} from '@angular/forms';
import { Subject, interval, startWith, takeUntil, map } from 'rxjs';
import {
  QuizQuestionDTO,
  QuizSubmissionRequest,
  QuizAnswerDTO,
  QuizResultResponse
} from './quiz_model';
import { QuizService } from './quiz_service';

const QUIZ_DURATION_SECONDS = 600; // 10 minutes

type AnswerGroup = FormGroup<{
  questionId: FormControl<number>;
  userAnswer: FormControl<string>;
}>;

type QuizForm = FormGroup<{
  answers: FormArray<AnswerGroup>;
}>;

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  certificateId!: number;
  questions: QuizQuestionDTO[] = [];

  form!: QuizForm;

  remainingSeconds = QUIZ_DURATION_SECONDS;
  private startEpoch = 0;

  private destroy$ = new Subject<void>();   // component lifecycle
  private timerStop$ = new Subject<void>(); // timer lifecycle
  private submittingOnce = false;           // prevent double submit

  submitting = false;
  loadError = '';
  submitError = '';
  result: QuizResultResponse | null = null;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (!this.submitting && !this.result) {
      e.preventDefault();
      e.returnValue = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((pm: ParamMap) => {
        const id = Number(pm.get('certificateId'));
        if (!id || Number.isNaN(id)) {
          this.loadError = 'Identifiant de certificat invalide.';
          return;
        }
        this.certificateId = id;
        this.resetQuiz();
      });
  }

  resetQuiz(): void {
    // stop any running timer
    this.timerStop$.next();
    this.timerStop$.complete();
    this.timerStop$ = new Subject<void>();

    // reset UI state
    this.questions = [];
    this.result = null;
    this.loadError = '';
    this.submitError = '';
    this.submitting = false;
    this.submittingOnce = false;
    this.remainingSeconds = QUIZ_DURATION_SECONDS;

    // fetch questions, build form, start timer
    this.quizService.getQuestions(this.certificateId).subscribe({
      next: (qs) => {
        this.questions = qs ?? [];
        this.buildForm(this.questions);
        this.startTimer();
      },
      error: () => (this.loadError = 'Impossible de charger les questions. Veuillez réessayer.')
    });
  }

  private buildForm(qs: QuizQuestionDTO[]) {
    const answersFA = this.fb.array<AnswerGroup>(
      qs.map(q =>
        this.fb.group({
          questionId: this.fb.control<number>(q.id),
          userAnswer: this.fb.control<string>('') // add Validators.required if needed
        })
      )
    );

    this.form = this.fb.group({
      answers: answersFA
    });
  }

  get answersFA(): FormArray<AnswerGroup> {
    return this.form.get('answers') as FormArray<AnswerGroup>;
  }

  answerGroupAt(i: number): AnswerGroup {
    return this.answersFA.at(i) as AnswerGroup;
  }

  private startTimer() {
    this.startEpoch = Date.now();
    interval(1000)
      .pipe(
        startWith(0),
        takeUntil(this.timerStop$),
        map(() =>
          Math.max(QUIZ_DURATION_SECONDS - Math.floor((Date.now() - this.startEpoch) / 1000), 0)
        )
      )
      .subscribe((sec) => {
        this.remainingSeconds = sec;
        if (sec === 0 && !this.submitting && !this.result) {
          this.submit(true);
        }
      });
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  submit(auto = false) {
    if (this.submitting || this.submittingOnce || !this.form) return;
    this.submitting = true;
    this.submitError = '';
    this.submittingOnce = true;

    const payload: QuizSubmissionRequest = {
      certificateId: this.certificateId,
      answers: this.answersFA.controls.map((g) => ({
        questionId: g.controls.questionId.value,
        userAnswer: g.controls.userAnswer.value.trim()
      })) as QuizAnswerDTO[]
    };

    this.quizService.submit(this.certificateId, payload).subscribe({
      next: (res) => {
        this.result = res;
        this.submitting = false;
        this.timerStop$.next();
      },
      error: () => {
        this.submitError = auto
          ? 'Temps écoulé, mais la soumission a échoué. Réessayez.'
          : 'Soumission échouée. Vérifiez votre connexion.';
        this.submitting = false;
        this.submittingOnce = false; // allow manual retry
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerStop$.next();
    this.timerStop$.complete();
  }
}
