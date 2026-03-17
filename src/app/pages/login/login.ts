import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Importa los módulos de Angular Material 
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
selector: 'app-login',
standalone: true,
 imports: [
  CommonModule,
  ReactiveFormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule
],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(private fb: FormBuilder,private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin() {

    if (this.loginForm.invalid) return;

    this.loading = true;

    setTimeout(() => {
      console.log(this.loginForm.value);
      this.router.navigate(['dashboard']);
      this.loading = false;
    }, 2000);

  }

}