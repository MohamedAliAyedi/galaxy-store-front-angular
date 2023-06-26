import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{

        const token = this.authService.getToken();
        const clonedRequest = req.clone({
            headers: req.headers
            .set('Authorization', "Bearer " + token)
            .set('Access-Control-Allow-Origin', "*")
            .set('Access-Control-Allow-Methods', "GET, POST, PUT, PATCH, DELETE, OPTIONS")
            .set('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization")
        });
        return next.handle(clonedRequest);
    }
}