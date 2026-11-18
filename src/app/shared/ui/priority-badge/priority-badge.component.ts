import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoService } from '@jsverse/transloco';
import { Priority, PRIORITY_COLORS } from '../../../models/enums';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="priority-badge" [style.color]="color()">
      <mat-icon class="priority-icon">flag</mat-icon>
      {{ label() }}
    </span>
  `,
  styles: [`
    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .priority-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `],
})
export class PriorityBadgeComponent {
  private readonly transloco = inject(TranslocoService);
  readonly priority = input.required<Priority>();

  readonly label = computed(() => this.transloco.translate(`priority.${this.priority()}`));
  readonly color = computed(() => PRIORITY_COLORS[this.priority()]);
}
