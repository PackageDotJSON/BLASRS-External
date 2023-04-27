import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { UserState } from 'src/app/state-management/user.state';

@Injectable({
  providedIn: 'root',
})
export class NotLoggedInGuard implements CanActivate, OnDestroy {
  isLoggedIn = false;
  subscription = new Subscription();

  constructor(private userState: UserState) {}

  canActivate() {
    return this.routeDeActivationFunction();
  }

  routeDeActivationFunction() {
    this.subscription.add(
      this.userState
        .userState()
        .pipe(
          tap((status) => {
            this.isLoggedIn = status;
          })
        )
        .subscribe()
    );

    return !this.isLoggedIn;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
