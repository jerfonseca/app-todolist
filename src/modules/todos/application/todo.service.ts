import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { PaginatedTodos, Todo } from "../domain/todo.model";
import { TodoRepository } from "../infra/todo.repository";

@Injectable({
    providedIn: "root"
})
export class TodoService {
    private todosSubject = new BehaviorSubject<Todo[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private paginationSubject = new BehaviorSubject<PaginatedTodos>({
        items: [],
        page: 1,
        limit: 4,
        total: 0,
        completedTotal: 0,
        totalPages: 1
    });

    public todos$: Observable<Todo[]> = this.todosSubject.asObservable();
    public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();
    public pagination$: Observable<PaginatedTodos> = this.paginationSubject.asObservable();

    constructor(private todoRepository: TodoRepository) {}

    async loadTodos(page = 1): Promise<void> {
        this.loadingSubject.next(true);
        try {
            const current = this.paginationSubject.value;
            const pagination = await this.todoRepository.getTodos(page, current.limit);
            this.todosSubject.next(pagination.items);
            this.paginationSubject.next(pagination);
        } catch (error) {
            console.error('Error loading todos', error);
            throw error;
        } finally {
            this.loadingSubject.next(false);
        }
    }

    async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
        this.loadingSubject.next(true);
        try {
            await this.todoRepository.createTodo(todo);
            await this.loadTodos(this.paginationSubject.value.page);
        } catch (error) {
            console.error('Error creating todo', error);
            throw error;
        } finally {
            this.loadingSubject.next(false);
        }
    }

    async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
        this.loadingSubject.next(true);
        try {
            await this.todoRepository.updateTodo(id, updates);
            await this.loadTodos(this.paginationSubject.value.page);
        } catch (error) {
            console.error('Error updating todo', error);
            throw error;
        } finally {
            this.loadingSubject.next(false);
        }
    }

    async completedTodo(id: string, updates: Partial<Todo>): Promise<void> {
        this.loadingSubject.next(true);
        try {
            await this.todoRepository.completedTodo(id, updates);
            await this.loadTodos(this.paginationSubject.value.page);
        } catch (error) {
            console.error('Error updating todo', error);
            throw error;
        } finally {
            this.loadingSubject.next(false);
        }
    }

    async deleteTodo(id: string): Promise<void> {
        this.loadingSubject.next(true);
        try {
            await this.todoRepository.deleteTodo(id);
            const current = this.paginationSubject.value;
            const targetPage = Math.min(current.page, Math.max(1, current.totalPages));
            await this.loadTodos(targetPage);
        } catch (error) {
            console.error('Error deleting todo', error);
            throw error;
        } finally {
            this.loadingSubject.next(false);
        }
    }
}