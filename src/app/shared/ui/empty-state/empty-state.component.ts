import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-message">{{ message() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button color="primary" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl) var(--spacing-md);
      text-align: center;
    }

    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--mat-sys-on-surface-variant);
      opacity: 0.5;
      margin-bottom: var(--spacing-md);
    }

    .empty-title {
      margin: 0 0 var(--spacing-sm);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .empty-message {
      margin: 0 0 var(--spacing-lg);
      color: var(--mat-sys-on-surface-variant);
      max-width: 320px;
    }
  `],
})
export class EmptyStateComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input<string>();
  readonly action = output();
}
