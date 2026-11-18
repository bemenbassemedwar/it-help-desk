import { ChangeDetectionStrategy, Component, inject, OnInit, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TranslocoModule } from '@jsverse/transloco';
import { SettingsViewModel } from './settings.view-model';
import { Priority, ReopenPolicy } from '../../../models/enums';
import { SkeletonLoaderComponent } from '../../../shared/ui/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    TranslocoModule,
    SkeletonLoaderComponent,
  ],
  providers: [SettingsViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
})
export class SettingsPage implements OnInit {
  protected readonly vm = inject(SettingsViewModel);
  private readonly fb = inject(FormBuilder);

  readonly priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  protected readonly form = this.fb.nonNullable.group({
    reopenPolicy: ['RETURN_TO_ENGINEER' as ReopenPolicy, Validators.required],
    reopenWindowDays: [7, [Validators.required, Validators.min(0)]],
    engineersCanSelfAssign: [true],
    engineersCanViewUnassigned: [true],
    slaHours: this.fb.nonNullable.group({
      LOW: [72, [Validators.required, Validators.min(1)]],
      MEDIUM: [48, [Validators.required, Validators.min(1)]],
      HIGH: [24, [Validators.required, Validators.min(1)]],
      CRITICAL: [4, [Validators.required, Validators.min(1)]],
    }),
  });

  constructor() {
    effect(() => {
      const settings = this.vm.settings();
      if (settings) {
        this.form.patchValue({
          reopenPolicy: settings.reopenPolicy,
          reopenWindowDays: settings.reopenWindowDays,
          engineersCanSelfAssign: settings.engineersCanSelfAssign,
          engineersCanViewUnassigned: settings.engineersCanViewUnassigned,
          slaHours: settings.slaHours,
        });
        this.form.markAsPristine();
      }
    });
  }

  ngOnInit(): void {
    this.vm.load();
  }

  protected onSave(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.vm.save({
      reopenPolicy: val.reopenPolicy,
      reopenWindowDays: val.reopenWindowDays,
      engineersCanSelfAssign: val.engineersCanSelfAssign,
      engineersCanViewUnassigned: val.engineersCanViewUnassigned,
      slaHours: val.slaHours as Record<Priority, number>,
    });
  }
}
