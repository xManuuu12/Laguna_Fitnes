import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type StatusType = 'loading' | 'ok' | 'error';

@Component({
  selector: 'app-status-template',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './status-template.html',
  styleUrl: './status-template.css'
})
export class StatusTemplateComponent {
  @Input() status: StatusType = 'ok';
  @Input() errorMessage: string = 'Ha ocurrido un error al cargar la información.';
}
