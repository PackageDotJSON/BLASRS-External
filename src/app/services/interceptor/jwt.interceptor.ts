import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { UserState } from 'src/app/state-management/user.state';
import { SessionStorageService } from '../session-storage/session-storage.service';
import { SESSION_STORAGE_KEY } from 'src/app/enums/session-storage-key.enum';

@Injectable()
export class JwtInterceptor implements HttpInterceptor, OnDestroy {
  subscription = new Subscription();
  constructor(
    private userState: UserState,
    private sessionStorageService: SessionStorageService
  ) {}

  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let userState;
    let jwtToken;

    this.subscription.add(
      this.userState
        .userState()
        .pipe(
          tap((status) => {
            userState = status;
          })
        )
        .subscribe()
    );

    userState === true &&
      (jwtToken = this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.TOKEN
      ));

    httpRequest = httpRequest.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    return next.handle(httpRequest);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
