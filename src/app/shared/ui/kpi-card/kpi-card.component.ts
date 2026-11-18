import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card [class.highlighted]="highlighted()" class="kpi-card" appearance="outlined">
      <mat-card-content class="kpi-content">
        <div class="kpi-icon-wrapper" [style.background]="color() || 'var(--mat-sys-primary-container)'">
          <mat-icon [style.color]="color() ? '#fff' : 'var(--mat-sys-on-primary-container)'">{{ icon() }}</mat-icon>
        </div>
        <div class="kpi-text">
          <span class="kpi-value">{{ value() }}</span>
          <span class="kpi-label">{{ label() }}</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .kpi-card {
      cursor: default;
      transition: box-shadow 0.2s;
    }

    .kpi-card.highlighted {
      border-color: var(--mat-sys-primary);
      border-width: 2px;
    }

    .kpi-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) !important;
    }

    .kpi-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .kpi-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .kpi-label {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class KpiCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly color = input<string>();
  readonly highlighted = input(false);
}
