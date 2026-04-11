import { Injectable } from "@angular/core";
import { User } from "./user.model";

const STORAGE_KEY = "app-todo-auth-user";
const TOKEN_KEY = "app-todo-auth-token";

@Injectable({
    providedIn: "root"
})
export class AuthRepository {
    private get storage(): Storage {
        return sessionStorage;
    }

    loadUser(): User | null {
        const raw = this.storage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw) as User;
        } catch {
            this.storage.removeItem(STORAGE_KEY);
            return null;
        }
    }

    saveUser(user: User): void {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    clearUser(): void {
        this.storage.removeItem(STORAGE_KEY);
    }

    loadToken(): string | null {
        return this.storage.getItem(TOKEN_KEY);
    }

    saveToken(token: string): void {
        this.storage.setItem(TOKEN_KEY, token);
    }

    clearToken(): void {
        this.storage.removeItem(TOKEN_KEY);
    }
}
