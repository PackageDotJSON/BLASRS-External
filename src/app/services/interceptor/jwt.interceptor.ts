import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { UserState } from 'src/app/state-management/user.state';
import { SessionStorageService } from '../session-storage/session-storage.service';
import { SESSION_STORAGE_KEY } from 'src/app/enums/session-storage-key.enum';
import { Router } from '@angular/router';
import { APP_ROUTES } from 'src/app/enums/routes.enum';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class JwtInterceptor implements HttpInterceptor, OnDestroy {
  private subscription = new Subscription();
  constructor(
    private userState: UserState,
    private sessionStorageService: SessionStorageService,
    private router: Router,
    private toastService: ToastrService
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

    return next.handle(httpRequest).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            event.body.statusCode === 401 &&
              (this.toastService.error(event.body.message),
              this.sessionStorageService.clearSessionStorage(),
              this.router.navigateByUrl(APP_ROUTES.LOGIN_URL));
          }
        },
        (error) => {
          if (error.status === 429) {
            this.toastService.error(error.message);
            this.sessionStorageService.clearSessionStorage();
            this.router.navigateByUrl(APP_ROUTES.LOGIN_URL);
            return;
          }
          this.toastService.error(
            'An unknown error has occurred. Please close the pop-up and attempt to upload again.',
            'Major Error',
            {
              timeOut: 20000,
            }
          );
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
