import { Component, OnDestroy, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { TodoService } from '../../application/todo.service';
import { TodoItemComponent } from '../../components/todo-item/todo-item.component';
import { TodoFormComponent } from '../../components/todo-form/todo-form.component';
import { PaginatedTodos, Todo } from '../../domain/todo.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../auth/application/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent, TodoFormComponent, MatButtonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatDialogModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit, OnDestroy {
  private todoService = inject(TodoService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private document = inject(DOCUMENT);

  todos$: Observable<Todo[]> = this.todoService.todos$;
  isLoading$: Observable<boolean> = this.todoService.isLoading$;
  pagination$: Observable<PaginatedTodos> = this.todoService.pagination$;
  showForm = false;
  editingTodo: Todo | null = null;

  ngOnInit() {
    this.loadTodos();
  }

  ngOnDestroy() {
    this.setBodyScrollLocked(false);
  }

  async loadTodos(page = 1) {
    try {
      await this.todoService.loadTodos(page);
    } catch (error) {
      // Handle error, maybe show message
      console.error(error);
    }
  }

  onAddTodo() {
    this.editingTodo = null;
    this.showForm = true;
    this.setBodyScrollLocked(true);
  }

  onEditTodo(todo: Todo) {
    this.editingTodo = todo;
    this.showForm = true;
    this.setBodyScrollLocked(true);
  }

  async onSaveTodo(todoData: Partial<Todo>) {
    try {
      if (this.editingTodo) {
        await this.todoService.updateTodo(this.editingTodo.id, todoData);
      } else {
        await this.todoService.createTodo(todoData as Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>);
      }
      this.closeForm();
    } catch (error) {
      // Handle error
      console.error(error);
    }
  }

  onCancelForm() {
    this.closeForm();
  }

  async onToggleComplete(todo: Todo) {
    await this.todoService.completedTodo(todo.id, { completed: !todo.completed });
  }

  async onDeleteTodo(todo: Todo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Eliminar tarea',
        message: `¿Seguro que deseas eliminar "${todo.title}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    try {
      await this.todoService.deleteTodo(todo.id);
    } catch (error) {
      console.error(error);
    }
  }

  async onPageChange(page: number, totalPages: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    await this.loadTodos(page);
  }

  getVisiblePages(currentPage: number, totalPages: number): number[] {
    const windowSize = 5;
    const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    const normalizedStart = Math.max(1, end - windowSize + 1);

    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
  }

  trackById(index: number, item: Todo): string {
    if (item.id) {
      return item.id;
    }

    return `${index}-${item.title}-${item.createdAt}`;
  }

  getCompletedCount(todos: Todo[]): number {
    return todos.filter((todo) => todo.completed).length;
  }

  onLogout() {
    this.authService.logout();
  }

  private closeForm() {
    this.showForm = false;
    this.editingTodo = null;
    this.setBodyScrollLocked(false);
  }

  private setBodyScrollLocked(isLocked: boolean) {
    this.document.body.classList.toggle('body-scroll-locked', isLocked);
  }
}