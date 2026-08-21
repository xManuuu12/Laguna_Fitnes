import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface PaymentConfirmDialogData {
  membresiaNombre: string;
  membresiaPrecio: number;
  incluyeInscripcion: boolean;
  precioInscripcion: number;
}

@Component({
  selector: 'app-payment-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirmar pago en efectivo</h2>
    <mat-dialog-content>
      <div class="concept-row">
        <span>{{ data.membresiaNombre }}</span>
        <span>\${{ data.membresiaPrecio | number:'1.2-2' }}</span>
      </div>
      <div class="concept-row" *ngIf="data.incluyeInscripcion">
        <span>Inscripción</span>
        <span>\${{ data.precioInscripcion | number:'1.2-2' }}</span>
      </div>
      <div class="concept-row total-row">
        <span>Total a cobrar</span>
        <span>\${{ total | number:'1.2-2' }}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="onConfirm()">Confirmar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .concept-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .total-row {
      border-bottom: none;
      padding-top: 12px;
      font-weight: 700;
    }
  `]
})
export class PaymentConfirmDialogComponent {
  public data: PaymentConfirmDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PaymentConfirmDialogComponent>);

  get total(): number {
    // Los DECIMAL de Sequelize llegan como string desde el backend (ej. "500.00"),
    // aunque el tipo declare number — hay que coercionar antes de sumar o concatena texto.
    const membresiaPrecio = Number(this.data.membresiaPrecio);
    const precioInscripcion = this.data.incluyeInscripcion ? Number(this.data.precioInscripcion) : 0;
    return membresiaPrecio + precioInscripcion;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}
