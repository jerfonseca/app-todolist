export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedTodos {
    items: Todo[];
    page: number;
    limit: number;
    total: number;
    completedTotal: number;
    totalPages: number;
}