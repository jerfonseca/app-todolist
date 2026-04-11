import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Todo } from '../../domain/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoFormComponent implements OnInit {
  @Input() todo: Todo | null = null;
  @Input() isLoading = false;
  @Output() save = new EventEmitter<Partial<Todo>>();
  @Output() cancel = new EventEmitter<void>();

  todoForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.todoForm = this.fb.group({
      title: [this.todo?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.todo?.description || '']
    });
  }

  onSubmit() {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;
      this.save.emit({
        ...formValue,
        completed: this.todo?.completed || false
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}