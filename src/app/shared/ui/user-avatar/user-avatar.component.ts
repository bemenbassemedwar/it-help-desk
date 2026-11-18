import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="avatar"
      [class]="'avatar-' + size()"
      [style.background]="color()"
      [attr.aria-label]="name()"
    >
      {{ initials() }}
    </span>
  `,
  styles: [`
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
      color: #fff;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .avatar-sm {
      width: 28px;
      height: 28px;
      font-size: 0.65rem;
    }

    .avatar-md {
      width: 36px;
      height: 36px;
      font-size: 0.8rem;
    }

    .avatar-lg {
      width: 48px;
      height: 48px;
      font-size: 1rem;
    }
  `],
})
export class UserAvatarComponent {
  readonly name = input.required<string>();
  readonly color = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] ?? '?').toUpperCase();
  });
}
