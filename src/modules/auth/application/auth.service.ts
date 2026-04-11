import { Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { AuthCredentials } from "../domain/auth-credentials.model";
import { User } from "../infra/user.model";
import { AuthRepository } from "../infra/auth.repository";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    private currentUser = signal<User | null>(this.authRepository.loadUser());

    constructor(
        private authRepository: AuthRepository,
        private router: Router,
        private http: HttpClient
    ) {
        this.syncSessionState();
    }

    get user(): User | null {
        return this.currentUser();
    }

    isLoggedIn(): boolean {
        return this.hasValidSession();
    }

    hasValidSession(): boolean {
        const token = this.authRepository.loadToken();
        if (!token) {
            this.clearSessionState();
            return false;
        }

        if (this.isJwtTokenExpired(token)) {
            this.clearSessionState();
            return false;
        }

        return true;
    }

    async login(credentials: AuthCredentials): Promise<string | null> {
        try {
            const response = await this.http.post<{ user: User; token: string }>(`${environment.apiBaseUrl}/users/login`, credentials).toPromise();
            if (response) {
                this.authRepository.saveUser(response.user);
                this.authRepository.saveToken(response.token);
                this.currentUser.set(response.user);
                this.router.navigate(["/todos"]);
            }

            return null;
        } catch (error) {
            console.error('Login failed', error);
            return this.getErrorMessage(error, 'Error al iniciar sesión.');
        }
    }

    async register(credentials: AuthCredentials): Promise<string | null> {
        try {
            const response = await this.http.post<{ user: User; token: string }>(`${environment.apiBaseUrl}/users/register`, credentials).toPromise();
            if (response) {
                this.authRepository.saveUser(response.user);
                this.authRepository.saveToken(response.token);
                this.currentUser.set(response.user);
                this.router.navigate(["/todos"]);
            }

            return null;
        } catch (error) {
            console.error('Register failed', error);
            return this.getErrorMessage(error, 'Error al registrar el usuario.');
        }
    }

    private getErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
            if (error.error && typeof error.error === 'object' && 'message' in error.error) {
                return String((error.error as { message?: string }).message || fallback);
            }

            if (error.error && typeof error.error === 'string') {
                return error.error;
            }

            return error.message || `${error.status} ${error.statusText}`;
        }

        return fallback;
    }

    logout(): void {
        this.clearSessionState();
        this.router.navigate(["/login"]);
    }

    private syncSessionState(): void {
        if (!this.hasValidSession()) {
            return;
        }

        if (!this.authRepository.loadUser()) {
            this.clearSessionState();
        }
    }

    private clearSessionState(): void {
        this.authRepository.clearUser();
        this.authRepository.clearToken();
        this.currentUser.set(null);
    }

    private isJwtTokenExpired(token: string): boolean {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return false;
        }

        try {
            const payload = JSON.parse(this.decodeBase64Url(parts[1])) as { exp?: number };
            if (typeof payload.exp !== 'number') {
                return false;
            }

            return payload.exp * 1000 <= Date.now();
        } catch {
            return true;
        }
    }

    private decodeBase64Url(value: string): string {
        const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
        return atob(padded);
    }

    private buildUser(credentials: AuthCredentials): User {
        return {
            id: `${credentials.email}-${Date.now()}`,
            email: credentials.email,
            name: credentials.name?.trim() || credentials.email.split("@")[0]
        };
    }
}
