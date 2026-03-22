import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Member } from '../../models/member.interface';
import { MembresiaService } from '../../services/membresia.service';
import { Membresia } from '../../models/membresia.interface';

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
  public data: { member?: Member } = inject(MAT_DIALOG_DATA);

  memberForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    estado: ['activo', [Validators.required]],
    // Campos para el pago inicial (opcionales)
    registrar_pago: [false],
    id_membresia: [null],
    metodo_pago: ['efectivo']
  });

  membresias: Membresia[] = [];
  isEditMode = false;

  ngOnInit() {
    this.loadMembresias();
    if (this.data?.member) {
      this.isEditMode = true;
      this.memberForm.patchValue(this.data.member);
      // Desactivar campos de pago en modo edición
      this.memberForm.get('registrar_pago')?.disable();
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

  onSubmit() {
    if (this.memberForm.valid) {
      // Devolver los valores incluyendo los campos deshabilitados si es necesario, 
      // o usar getRawValue()
      this.dialogRef.close(this.memberForm.getRawValue());
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
