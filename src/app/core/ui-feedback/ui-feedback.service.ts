import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  success(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  async confirm(title: string, message: string, color: 'primary' | 'warn' = 'primary'): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title, message, color } satisfies ConfirmDialogData,
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    return result === true;
  }
}
