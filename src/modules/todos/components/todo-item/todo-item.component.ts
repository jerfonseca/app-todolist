import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Todo } from '../../domain/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatIconModule],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent implements OnChanges {
  private readonly descriptionToggleThreshold = 120;

  @Input() todo!: Todo;
  @Output() toggleComplete = new EventEmitter<Todo>();
  @Output() edit = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<Todo>();

  isDescriptionExpanded = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo']) {
      this.isDescriptionExpanded = false;
    }
  }

  canToggleDescription(): boolean {
    const description = this.todo?.description?.trim() ?? '';
    return description.length > this.descriptionToggleThreshold;
  }

  get titleId(): string {
    return `${this.getTodoIdentifier()}-title`;
  }

  get descriptionId(): string {
    return `${this.getTodoIdentifier()}-description`;
  }

  get dateId(): string {
    return `${this.getTodoIdentifier()}-date`;
  }

  get articleDescriptionId(): string {
    return this.todo?.description ? `${this.descriptionId} ${this.dateId}` : this.dateId;
  }

  get toggleCompleteAriaLabel(): string {
    const status = this.todo?.completed ? 'marcar como pendiente' : 'marcar como completada';
    return `${status}: ${this.todo?.title ?? 'tarea'}`;
  }

  get toggleDescriptionAriaLabel(): string {
    const action = this.isDescriptionExpanded ? 'Ocultar descripción de' : 'Mostrar descripción completa de';
    return `${action} ${this.todo?.title ?? 'la tarea'}`;
  }

  get editAriaLabel(): string {
    return `Editar tarea ${this.todo?.title ?? ''}`.trim();
  }

  get deleteAriaLabel(): string {
    return `Eliminar tarea ${this.todo?.title ?? ''}`.trim();
  }

  onToggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  onToggleComplete() {
    this.toggleComplete.emit(this.todo);
  }

  onEdit() {
    this.edit.emit(this.todo);
  }

  onDelete() {
    this.delete.emit(this.todo);
  }

  private getTodoIdentifier(): string {
    const rawIdentifier = this.todo?.id?.trim() || this.todo?.title?.trim() || 'todo';
    return rawIdentifier.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
}