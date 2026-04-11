import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="dialog-icon" color="warn">warning</mat-icon>
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <p class="dialog-message">{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="onCancel()">
        {{ data.cancelText || 'Cancelar' }}
      </button>
      <button mat-flat-button color="warn" type="button" (click)="onConfirm()">
        {{ data.confirmText || 'Eliminar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dialog-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      .dialog-message {
        margin: 0;
        color: rgba(0, 0, 0, 0.75);
      }
    `
  ]
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
