import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoService } from '@jsverse/transloco';
import { TicketStatus, STATUS_COLORS, STATUS_TEXT_COLORS, STATUS_ICONS } from '../../../models/enums';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="badge"
      [style.background]="bgColor()"
      [style.color]="textColor()"
    >
      <mat-icon class="badge-icon">{{ icon() }}</mat-icon>
      {{ label() }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      line-height: 1.6;
    }

    .badge-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
  `],
})
export class StatusBadgeComponent {
  private readonly transloco = inject(TranslocoService);
  readonly status = input.required<TicketStatus>();

  readonly label = computed(() => this.transloco.translate(`status.${this.status()}`));
  readonly icon = computed(() => STATUS_ICONS[this.status()]);
  readonly bgColor = computed(() => STATUS_COLORS[this.status()]);
  readonly textColor = computed(() => STATUS_TEXT_COLORS[this.status()]);
}
