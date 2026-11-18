import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';
import { NewTicketViewModel } from './new-ticket.view-model';

@Component({
  selector: 'app-new-ticket-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    TranslocoModule,
  ],
  providers: [NewTicketViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-ticket.page.html',
  styleUrl: './new-ticket.page.scss',
})
export class NewTicketPage implements OnInit {
  protected readonly vm = inject(NewTicketViewModel);
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    categoryId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.vm.load();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, description, categoryId } = this.form.getRawValue();
    this.vm.submit({ title, description, categoryId });
  }

  protected onBack(): void {
    this.location.back();
  }
}
