import { Routes } from "@angular/router";
import { AuthGuard } from "../core/guards/auth.guard";
import { authRoutes } from "../modules/auth/auth.routes";
import { todoRoutes } from "../modules/todos/todos.routes";

export const routes: Routes = [
    {
        path: "",
        pathMatch: "full",
        redirectTo: "todos"
    },
    ...authRoutes,
    {
        path: "todos",
        canActivateChild: [AuthGuard],
        children: todoRoutes
    },
    {
        path: "**",
        redirectTo: "todos"
    }
];
