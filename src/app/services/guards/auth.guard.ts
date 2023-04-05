import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, CanLoad } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { UserState } from 'src/app/state-management/user.state';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad, OnDestroy {
  isActivate = false;
  subscription = new Subscription();

  constructor(private userState: UserState) {}

  canActivate() {
    return this.routeActivationFunction();
  }

  canLoad(): boolean {
    return this.routeActivationFunction();
  }

  routeActivationFunction() {
    this.subscription.add(
      this.userState
        .userState()
        .pipe(
          tap((status) => {
            this.isActivate = status;
          })
        )
        .subscribe()
    );

    return this.isActivate;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
