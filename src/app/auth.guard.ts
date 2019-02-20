import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }

  verifyLogin(url): boolean {
    if (!this.isLoggedIn()) {
        this.router.navigate(['/login']);
        return false;
    } else if (this.isLoggedIn()) {
        return true;
    }
}
public isLoggedIn(): boolean {
    let status = false;
    if ( localStorage.getItem('isLoggedIn') === 'true') {
      status = true;
    } else {
      status = false;
    }
    return status;
}
}
