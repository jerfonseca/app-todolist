import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { PaginatedTodos, Todo } from "../domain/todo.model";
import { environment } from "../../../environments/environment";
import { AuthRepository } from "../../auth/infra/auth.repository";

@Injectable({
    providedIn: "root"
})
export class TodoRepository {
    constructor(private http: HttpClient, private authRepository: AuthRepository) {}

    private getHeaders(): HttpHeaders {
        const token = this.authRepository.loadToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return new HttpHeaders(headers);
    }

    async getTodos(page = 1, limit = 5): Promise<PaginatedTodos> {
        const response = await this.http
            .get<unknown>(`${environment.apiBaseUrl}/todos?page=${page}&limit=${limit}`, { headers: this.getHeaders() })
            .toPromise();

        return this.normalizePaginatedResponse(response, page, limit);
    }

    async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
        const response = await this.http.post<Todo>(`${environment.apiBaseUrl}/todos`, todo, { headers: this.getHeaders() }).toPromise();
        return response!;
    }

    async updateTodo(id: string, todo: Partial<Todo>): Promise<Todo> {
        const response = await this.http.put<Todo>(`${environment.apiBaseUrl}/todos/${id}`, todo, { headers: this.getHeaders() }).toPromise();
        return response!;
    }

    async completedTodo(id: string, todo: Partial<Todo>): Promise<Todo> {
        const response = await this.http.patch<Todo>(`${environment.apiBaseUrl}/todos/${id}/completed`, todo, { headers: this.getHeaders() }).toPromise();
        return response!;
    }

    async deleteTodo(id: string): Promise<void> {
        await this.http.delete(`${environment.apiBaseUrl}/todos/${id}`, { headers: this.getHeaders() }).toPromise();
    }

    private normalizePaginatedResponse(response: unknown, requestedPage: number, requestedLimit: number): PaginatedTodos {
        if (Array.isArray(response)) {
            const items = response.map((todo) => this.normalizeTodo(todo as Todo));
            return {
                items,
                page: requestedPage,
                limit: requestedLimit,
                total: items.length,
                completedTotal: items.filter((todo) => todo.completed).length,
                totalPages: 1
            };
        }

        if (!response || typeof response !== "object") {
            return {
                items: [],
                page: requestedPage,
                limit: requestedLimit,
                total: 0,
                completedTotal: 0,
                totalPages: 1
            };
        }

        const payload = response as Record<string, unknown>;
        const rawItems = this.extractItems(payload);
        const items = rawItems.map((todo) => this.normalizeTodo(todo));

        const meta = (payload['meta'] ?? payload['pagination'] ?? payload['pageInfo'] ?? {}) as Record<string, unknown>;
        const page = this.toNumber(meta['page'] ?? payload['page'], requestedPage);
        const limit = this.toNumber(meta['limit'] ?? meta['perPage'] ?? payload['limit'] ?? payload['perPage'], requestedLimit);
        const total = this.toNumber(meta['total'] ?? payload['total'], items.length);
        const completedTotal = this.toNumber(
            meta['completedTotal'] ?? meta['completed_total'] ?? payload['completedTotal'] ?? payload['completed_total'],
            items.filter((todo) => todo.completed).length
        );
        const totalPages = this.toNumber(
            meta['totalPages'] ?? payload['totalPages'],
            Math.max(1, Math.ceil(total / Math.max(1, limit)))
        );

        return {
            items,
            page,
            limit,
            total,
            completedTotal,
            totalPages
        };
    }

    private extractItems(payload: Record<string, unknown>): Todo[] {
        const candidate = payload['items'] ?? payload['data'] ?? payload['todos'] ?? payload['results'];
        if (!Array.isArray(candidate)) {
            return [];
        }

        return candidate as Todo[];
    }

    private normalizeTodo(todo: Todo): Todo {
        const record = todo as unknown as Record<string, unknown>;
        const id = (record['id'] ?? record['_id'] ?? '').toString();
        const title = (record['title'] ?? '').toString();
        const description = (record['description'] ?? record['details'] ?? '').toString();
        const completed = Boolean(record['completed']);
        const createdAtRaw = record['created_date'] ?? record['createdAt'] ?? record['created_at'] ?? new Date().toISOString();
        const updatedAtRaw = record['updated_date'] ?? record['updatedAt'] ?? record['updated_at'] ?? createdAtRaw;

        return {
            id,
            title,
            description,
            completed,
            createdAt: this.parseDateValue(createdAtRaw),
            updatedAt: this.parseDateValue(updatedAtRaw)
        };
    }

    private parseDateValue(value: unknown): Date {
        if (value instanceof Date) {
            return value;
        }

        if (typeof value === "string" || typeof value === "number") {
            return new Date(value);
        }

        if (value && typeof value === "object") {
            const timestamp = value as Record<string, unknown>;
            const seconds = timestamp['_seconds'];
            const nanoseconds = timestamp['_nanoseconds'];

            if (typeof seconds === "number") {
                const msFromSeconds = seconds * 1000;
                const msFromNanos = typeof nanoseconds === "number" ? Math.floor(nanoseconds / 1_000_000) : 0;
                return new Date(msFromSeconds + msFromNanos);
            }
        }

        return new Date();
    }

    private toNumber(value: unknown, fallback: number): number {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === "string") {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }

        return fallback;
    }
}