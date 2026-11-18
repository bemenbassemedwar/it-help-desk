import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">
        {{ data.cancelText || ('actions.cancel' | transloco) }}
      </button>
      <button mat-flat-button [color]="data.color || 'primary'" (click)="dialogRef.close(true)">
        {{ data.confirmText || ('actions.confirm' | transloco) }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content p {
      margin: 0;
      line-height: 1.5;
    }
  `],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
