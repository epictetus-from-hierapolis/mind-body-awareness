import { Component, inject, computed, effect, output, viewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { JournalStorage } from './journal-storage';
import { MbaConfig } from '../../shared/config';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JournalRecord } from './journal-record';
import { ScrollTop } from '../../shared/scroll-top/scroll-top';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mba-journal-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ScrollTop,
  ],
  templateUrl: './journal-form.html',
  styleUrl: './journal-form.scss',
})
export class JournalForm implements OnInit {
  private readonly configService = inject(MbaConfig);
  private readonly storageService = inject(JournalStorage);
  private readonly fb = inject(FormBuilder);

  public readonly saved = output<void>();
  protected readonly stepper = viewChild<MatStepper>('stepper');

  protected readonly journalForm: FormGroup = this.fb.group({
    step1: this.fb.group({
      sensations: [[], Validators.required],
      rootCause: ['']
    }),
    step2: this.fb.group({ posEmotions: [[]] }),
    step3: this.fb.group({ negEmotions: [[]] }),
    step4: this.fb.group({ needsMap: this.fb.group({}) })
  });

  // signals
  protected readonly selectedNegEmotions = toSignal(
    this.journalForm.get('step3.negEmotions')!.valueChanges,
    { initialValue: [] as string[] }
  );
  private readonly formValue = toSignal(this.journalForm.valueChanges, {
    initialValue: this.journalForm.value
  });
  protected readonly canSave = computed(() => {
    const value = this.formValue();
    return (
      value.step1?.sensations?.length > 0 ||
      value.step2?.posEmotions?.length > 0 ||
      value.step3?.negEmotions?.length > 0
    );
  });

  protected readonly availableSensations = this.configService.sensations;
  protected readonly positiveEmotions = this.configService.positiveEmotions;
  protected readonly negativeEmotions = this.configService.negativeEmotions;

  ngOnInit() {
    this.syncNeedsFormGroup(this.selectedNegEmotions());
  }

  constructor() {
    effect(() => {
      const selected = this.selectedNegEmotions();
      this.syncNeedsFormGroup(selected);
    });
  }

  protected get step1() { return this.journalForm.get('step1') as FormGroup; }
  protected get step2() { return this.journalForm.get('step2') as FormGroup; }
  protected get step3() { return this.journalForm.get('step3') as FormGroup; }
  protected get step4() { return this.journalForm.get('step4') as FormGroup; }
  protected get needsMap() { return this.journalForm.get('step4.needsMap') as FormGroup; }

  private syncNeedsFormGroup(emotions: string[]) {
    const needsGroup = this.needsMap;
    const currentControls = Object.keys(needsGroup.controls);
    const newEmotions = emotions || [];

    // Remove controls for emotions no longer selected
    currentControls.forEach(controlName => {
      if (!newEmotions.includes(controlName)) {
        needsGroup.removeControl(controlName);
      }
    });

    // Add controls for new selected emotions
    newEmotions.forEach(emotion => {
      if (!needsGroup.contains(emotion)) {
        needsGroup.addControl(emotion, this.fb.control(''));
      }
    });
  }

  protected async saveEntry() {
    if (this.journalForm.invalid) {
      return;
    }

    const rawValue = this.journalForm.value;

    const newRecord = new JournalRecord({
      sensations: rawValue.step1.sensations,
      rootCause: rawValue.step1.rootCause,
      positiveEmotions: rawValue.step2.posEmotions,
      negativeEmotions: rawValue.step3.negEmotions,
      needs: rawValue.step4.needsMap
    });

    try {
      await this.storageService.addRecord(newRecord);
      this.saved.emit();
      this.journalForm.reset();
      this.stepper()?.reset();
    } catch (error) {
      console.error('Eroare la salvarea în IndexedDB:', error);
    }
  }

  protected scrollTopOnStepChange() {
    const scrollContainer = document.querySelector('.mat-mdc-tab-body-active .mat-mdc-tab-body-content');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
    }
  }


}