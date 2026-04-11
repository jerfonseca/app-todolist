import { Routes } from "@angular/router";
import { NoAuthGuard } from "../../core/guards/no-auth.guard";

export const authRoutes: Routes = [
    {
        path: "login",
        loadComponent: () => import("./pages/login/login.component").then((m) => m.LoginComponent),
        canActivate: [NoAuthGuard]
    },
    {
        path: "register",
        loadComponent: () => import("./pages/register/register.component").then((m) => m.RegisterComponent),
        canActivate: [NoAuthGuard]
    }
];