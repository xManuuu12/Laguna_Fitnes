import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MembresiaService } from '../../services/membresia.service';
import { AuthService } from '../../services/auth.service';
import { Membresia } from '../../models/membresia.interface';
import { User } from '../../models/auth.interface';
import { StatusTemplateComponent, StatusType } from '../../components/status-template/status-template';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    StatusTemplateComponent
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private membresiaService = inject(MembresiaService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  status: StatusType = 'loading';
  // Membresías
  membresias: Membresia[] = [];
  membresiaDataSource = new MatTableDataSource<Membresia>([]);
  membresiaColumns: string[] = ['nombre', 'precio', 'duracion', 'acciones'];
  membresiaForm: FormGroup;
  editingMembresiaId: number | null = null;

  // Usuarios
  users: User[] = [];
  userDataSource = new MatTableDataSource<User>([]);
  userColumns: string[] = ['nombre', 'email', 'rol', 'acciones'];
  userForm: FormGroup;
  editingUserId: number | null = null;

  constructor() {
    this.membresiaForm = this.fb.group({
      nombre: ['', [Validators.required]],
      precio: [null, [Validators.required, Validators.min(0)]],
      duracion_dias: [null, [Validators.required, Validators.min(1)]]
    });

    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['recepcion', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.status = 'loading';
    this.loadMembresias();
    this.loadUsers();
  }

  // --- Membresías ---
  loadMembresias() {
    this.membresiaService.getAllMembresias().subscribe({
      next: (res) => {
        if (res.success) {
          this.membresias = res.data || [];
          this.membresiaDataSource.data = this.membresias;
          this.status = 'ok';
        } else {
          this.status = 'error';
        }
      },
      error: () => this.status = 'error'
    });
  }

  onSubmitMembresia() {
    if (this.membresiaForm.invalid) return;

    if (this.editingMembresiaId) {
      this.membresiaService.updateMembresia(this.editingMembresiaId, this.membresiaForm.value).subscribe({
        next: () => {
          this.snackBar.open('Membresía actualizada', 'Cerrar', { duration: 3000 });
          this.resetMembresiaForm();
          this.loadMembresias();
        }
      });
    } else {
      this.membresiaService.createMembresia(this.membresiaForm.value).subscribe({
        next: () => {
          this.snackBar.open('Membresía creada', 'Cerrar', { duration: 3000 });
          this.resetMembresiaForm();
          this.loadMembresias();
        }
      });
    }
  }

  editMembresia(membresia: Membresia) {
    this.editingMembresiaId = membresia.id_membresia!;
    this.membresiaForm.patchValue(membresia);
  }

  deleteMembresia(id: number) {
    if (confirm('¿Estás seguro de eliminar esta membresía?')) {
      this.membresiaService.deleteMembresia(id).subscribe({
        next: () => {
          this.snackBar.open('Membresía eliminada', 'Cerrar', { duration: 3000 });
          this.loadMembresias();
        }
      });
    }
  }

  resetMembresiaForm() {
    this.membresiaForm.reset();
    this.editingMembresiaId = null;
  }

  // --- Usuarios ---
  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data || [];
          this.userDataSource.data = this.users;
          this.status = 'ok';
        } else {
          this.status = 'error';
        }
      },
      error: () => this.status = 'error'
    });
  }

  onSubmitUser() {
    if (this.userForm.invalid) return;

    if (this.editingUserId) {
      const { password, ...userData } = this.userForm.value;
      // Solo enviar password si se cambió (opcional según backend)
      const dataToUpdate = password ? this.userForm.value : userData;
      
      this.authService.updateUser(this.editingUserId, dataToUpdate).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
          this.resetUserForm();
          this.loadUsers();
        }
      });
    } else {
      this.authService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
          this.resetUserForm();
          this.loadUsers();
        }
      });
    }
  }

  editUser(user: User) {
    this.editingUserId = user.id_usuario;
    this.userForm.patchValue({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      password: '' // No cargar password
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  deleteUser(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.authService.deleteUser(id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        }
      });
    }
  }

  resetUserForm() {
    this.userForm.reset({ rol: 'recepcion' });
    this.editingUserId = null;
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }
}
