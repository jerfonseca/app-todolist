import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
    selector: "app-register",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.scss"]
})
export class RegisterComponent {
    form = new FormGroup({
        name: new FormControl("", [Validators.required]),
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [Validators.required, Validators.minLength(6)])
    });

    errorMessage: string | null = null;
    isLoading = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(["/todos"]);
        }
    }

    async submit(): Promise<void> {
        this.errorMessage = null;
        this.isLoading = true;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.isLoading = false;
            return;
        }

        const error = await this.authService.register({
            name: this.form.value.name ?? "",
            email: this.form.value.email ?? "",
            password: this.form.value.password ?? ""
        });

        this.isLoading = false;

        if (error) {
            this.errorMessage = error;
        }
    }
}
