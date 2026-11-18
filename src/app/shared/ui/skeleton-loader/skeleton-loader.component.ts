import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-wrapper" [class]="'skeleton-' + type()">
      @switch (type()) {
        @case ('card') {
          <div class="skeleton-block skeleton-card"></div>
        }
        @case ('table') {
          @for (i of lineArray(); track i) {
            <div class="skeleton-row">
              <div class="skeleton-block" style="width: 15%"></div>
              <div class="skeleton-block" style="width: 35%"></div>
              <div class="skeleton-block" style="width: 20%"></div>
              <div class="skeleton-block" style="width: 15%"></div>
            </div>
          }
        }
        @default {
          @for (i of lineArray(); track i) {
            <div
              class="skeleton-block skeleton-line"
              [style.width]="i === lineArray().length - 1 ? '60%' : '100%'"
            ></div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-block {
      background: linear-gradient(
        90deg,
        var(--mat-sys-surface-container) 25%,
        var(--mat-sys-surface-container-high) 50%,
        var(--mat-sys-surface-container) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-line {
      height: 14px;
    }

    .skeleton-card {
      height: 120px;
      border-radius: var(--radius-md);
    }

    .skeleton-row {
      display: flex;
      gap: 12px;
      height: 40px;
      align-items: center;
    }

    .skeleton-row .skeleton-block {
      height: 14px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonLoaderComponent {
  readonly type = input<'text' | 'card' | 'table'>('text');
  readonly lines = input(3);

  readonly lineArray = computed(() => Array.from({ length: this.lines() }, (_, i) => i));
}
