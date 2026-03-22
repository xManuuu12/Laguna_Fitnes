import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.interface';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-visit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './visit-dialog.html',
  styleUrls: ['./visit-dialog.css']
})
export class VisitDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<VisitDialogComponent>);
  private memberService = inject(MemberService);

  visitForm: FormGroup = this.fb.group({
    id_miembro: ['', [Validators.required]],
    fecha_visita: [new Date().toISOString().split('T')[0], [Validators.required]],
    hora_entrada: [new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), [Validators.required]],
    comentarios: ['']
  });

  members: Member[] = [];
  filteredMembers!: Observable<Member[]>;

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getAllMembers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.members = response.data;
          this.setupFilter();
        }
      }
    });
  }

  setupFilter() {
    this.filteredMembers = this.visitForm.get('id_miembro')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : ''),
      map(name => name ? this._filter(name) : this.members.slice())
    );
  }

  private _filter(name: string): Member[] {
    const filterValue = name.toLowerCase();
    return this.members.filter(member => 
      `${member.nombre} ${member.apellido}`.toLowerCase().includes(filterValue)
    );
  }

  displayFn(memberId: number): string {
    if (!memberId) return '';
    const member = this.members.find(m => m.id_miembro === memberId);
    return member ? `${member.nombre} ${member.apellido}` : '';
  }

  onMemberSelected(event: any) {
    const member = event.option.value;
    this.visitForm.patchValue({ id_miembro: member.id_miembro });
  }

  onSubmit() {
    if (this.visitForm.valid) {
      this.dialogRef.close(this.visitForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
