import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
} from '@angular/forms';
import { interval, Subject, switchMap, takeUntil, map } from 'rxjs';

import { CertificateService } from '../certificate.service';
import { QuizService } from './quiz_service'; // change to './quiz.service' if that's your file

// ---- Types kept flexible to tolerate backend shape differences ----
type QuizQuestionView = {
  id: number;
  text: string;
  options?: string[]; // if present => MCQ, else open text
  mark?: number;
};

type OutAnswer = {
  questionId: number;
  chosenIndex?: number;  // for MCQ
  userAnswer?: string;   // for open text
};

type QuizResultResponse = {
  totalQuestions?: number;
  totalMarks?: number;
  score?: number;
  passed?: boolean;
  submissionId?: number | null;
};

const DEFAULT_DURATION_SECONDS = 900; // 15 min fallback

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent implements OnInit, OnDestroy {
  certificateId!: number;

  // questions prepared for the template
  questions: QuizQuestionView[] = [];

  // form
  selectionsFA!: FormArray<FormControl<number | null>>; // for MCQ (radio)
  textAnswersFA!: FormArray<FormControl<string>>;        // for open text

  form!: FormGroup<{
    selections: FormArray<FormControl<number | null>>;
    textAnswers: FormArray<FormControl<string>>;
  }>;

  // timing
  remainingSeconds = DEFAULT_DURATION_SECONDS;
  private startEpoch = 0;
  private destroy$ = new Subject<void>();
  private timerStop$ = new Subject<void>();

  // ui flags
  loading = false;
  submitting = false;
  loadError = '';
  submitError = '';

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (!this.submitting) {
      e.preventDefault();
      e.returnValue = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: NonNullableFormBuilder,
    private quizService: QuizService,
    private certService: CertificateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((pm: ParamMap) => {
      // MUST MATCH the route: /quiz/:certificateId
      const id = Number(pm.get('certificateId'));
      if (!id || Number.isNaN(id)) {
        this.loadError = 'Identifiant de certificat invalide.';
        return;
      }
      this.certificateId = id;
      this.initQuiz();
    });
  }

  /** Logout handler used by the header button */
  logout(): void {
    try {
      localStorage.removeItem('authToken'); // adjust if you use a different key
    } catch {}
    this.router.navigate(['/login']);
  }

  /** Safe helper for option letter to avoid ICU parse issues in template */
  getLetter(j: number): string {
    const letters = ['A', 'B', 'C', 'D'];
    return typeof j === 'number' && j >= 0 && j < letters.length ? letters[j] : '';
  }

  private initQuiz() {
    // stop any previous timer
    this.timerStop$.next();
    this.timerStop$.complete();
    this.timerStop$ = new Subject<void>();

    this.loading = true;
    this.loadError = '';
    this.submitError = '';

    // 1) read quiz duration from certificate (if provided)
    this.certService
      .getCertificateById(this.certificateId)
      .pipe(
        switchMap((cert: any) => {
          const duration = Number(cert?.durationSeconds ?? DEFAULT_DURATION_SECONDS);
          this.remainingSeconds = Number.isFinite(duration) ? duration : DEFAULT_DURATION_SECONDS;
          // 2) fetch questions
          return this.quizService.getQuestions(this.certificateId);
        })
      )
      .subscribe({
        next: (qs: any[]) => {
          this.questions = (qs || []).map(this.adaptQuestion);
          this.buildForm();
          this.loading = false;
          this.startTimer();
        },
        error: () => {
          this.loading = false;
          this.loadError = 'Impossible de charger le quiz. Veuillez réessayer.';
        },
      });
  }

  // normalize server shapes for the UI
  private adaptQuestion = (q: any): QuizQuestionView => {
    const id = Number(q?.id ?? q?.questionId ?? 0);
    const text = String(q?.text ?? q?.questionText ?? '').trim();
    const mark = Number(q?.mark ?? 0);

    const options =
      Array.isArray(q?.options) && q.options.length
        ? q.options
        : [q?.optionA, q?.optionB, q?.optionC, q?.optionD]
            .filter((v: any) => typeof v === 'string' && v !== '') as string[];

    return {
      id,
      text,
      options: options && options.length ? options : undefined,
      mark: Number.isFinite(mark) ? mark : undefined,
    };
  };

  private buildForm() {
    this.selectionsFA = this.fb.array<FormControl<number | null>>(
      this.questions.map(() => this.fb.control<number | null>(null))
    );

    this.textAnswersFA = this.fb.array<FormControl<string>>(
      this.questions.map(() => this.fb.control<string>(''))
    );

    this.form = this.fb.group({
      selections: this.selectionsFA,
      textAnswers: this.textAnswersFA,
    });
  }

  isMcq(q: QuizQuestionView): boolean {
    return Array.isArray(q.options) && q.options.length > 0;
  }

  private startTimer() {
    const total = this.remainingSeconds;
    this.startEpoch = Date.now();

    interval(1000)
      .pipe(
        takeUntil(this.timerStop$),
        map(() => Math.max(total - Math.floor((Date.now() - this.startEpoch) / 1000), 0))
      )
      .subscribe((sec) => {
        this.remainingSeconds = sec;
        if (sec === 0 && !this.submitting) {
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
    if (this.submitting || !this.form || !this.questions.length) return;
    this.submitting = true;
    this.submitError = '';

    // Build payload (MCQ => chosenIndex, open text => userAnswer)
    const answers: OutAnswer[] = this.questions.map((q, i) => {
      if (this.isMcq(q)) {
        const idx = this.selectionsFA.at(i).value;
        return { questionId: q.id, chosenIndex: typeof idx === 'number' ? idx : -1 };
        // for open text:
      } else {
        const txt = (this.textAnswersFA.at(i).value || '').trim();
        return { questionId: q.id, userAnswer: txt };
      }
    });

    this.quizService.submit(this.certificateId, { certificateId: this.certificateId, answers })
      .subscribe({
        next: (res: QuizResultResponse) => {
          this.submitting = false;
          this.timerStop$.next();

          const sid = res?.submissionId ?? null;
          if (sid !== null && sid !== undefined) {
            this.router.navigate(['/submissions', sid]);
          }
        },
        error: () => {
          this.submitting = false;
          this.submitError = auto
            ? 'Temps écoulé, mais la soumission a échoué. Réessayez.'
            : 'Soumission échouée. Vérifiez votre connexion.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timerStop$.next();
    this.timerStop$.complete();
  }
}
