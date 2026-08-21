import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Member } from '../../models/member.interface';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia.interface';
import { GimnasioService } from '../../services/gimnasio.service';
import { PaymentConfirmDialogComponent } from './payment-confirm-dialog';

@Component({
  selector: 'app-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './member-dialog.html',
  styleUrls: ['./member-dialog.css']
})
export class MemberDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<MemberDialogComponent>);
  private membresiaService = inject(MembresiaService);
  private gimnasioService = inject(GimnasioService);
  private dialog = inject(MatDialog);
  public data: { member?: Member } = inject(MAT_DIALOG_DATA);

  memberForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    estado: ['activo', [Validators.required]],
    // Campos para el pago inicial (opcionales)
    registrar_pago: [false],
    id_membresia: [null],
    metodo_pago: ['efectivo'],
    // Solo relevante en alta (no en edición): suma el precio de inscripción
    // del gimnasio al primer pago del socio (el backend calcula el monto).
    incluir_inscripcion: [false]
  });

  membresias: Membresia[] = [];
  precioInscripcion = 0;
  isEditMode = false;

  ngOnInit() {
    this.loadMembresias();
    this.loadGimnasio();
    if (this.data?.member) {
      this.isEditMode = true;
      this.memberForm.patchValue(this.data.member);
      // Permitimos registrar pago también en modo edición
    }

    // Suscribirse a cambios en registrar_pago para validar campos de membresía
    this.memberForm.get('registrar_pago')?.valueChanges.subscribe(value => {
      const membresiaCtrl = this.memberForm.get('id_membresia');
      const metodoCtrl = this.memberForm.get('metodo_pago');
      
      if (value) {
        membresiaCtrl?.setValidators([Validators.required]);
        metodoCtrl?.setValidators([Validators.required]);
      } else {
        membresiaCtrl?.clearValidators();
        metodoCtrl?.clearValidators();
      }
      membresiaCtrl?.updateValueAndValidity();
      metodoCtrl?.updateValueAndValidity();
    });
  }

  loadMembresias() {
    this.membresiaService.getAllMembresias().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.membresias = response.data;
        }
      }
    });
  }

  loadGimnasio() {
    this.gimnasioService.getGimnasio().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.precioInscripcion = response.data.precio_inscripcion;
        }
      }
    });
  }

  onSubmit() {
    if (!this.memberForm.valid) return;

    const formValue = this.memberForm.getRawValue();

    const requiereConfirmacionEfectivo =
      !this.isEditMode &&
      formValue.registrar_pago &&
      formValue.metodo_pago === 'efectivo' &&
      formValue.id_membresia;

    if (requiereConfirmacionEfectivo) {
      const membresia = this.membresias.find(m => m.id_membresia === formValue.id_membresia);
      if (!membresia) return;

      const dialogRef = this.dialog.open(PaymentConfirmDialogComponent, {
        width: '400px',
        data: {
          membresiaNombre: membresia.nombre,
          membresiaPrecio: membresia.precio,
          incluyeInscripcion: formValue.incluir_inscripcion,
          precioInscripcion: this.precioInscripcion
        }
      });

      dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.dialogRef.close(formValue);
        }
      });
      return;
    }

    this.dialogRef.close(formValue);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
