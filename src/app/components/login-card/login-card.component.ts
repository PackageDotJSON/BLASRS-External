import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { SESSION_STORAGE_KEY } from 'src/app/enums/session-storage-key.enum';
import { APP_ROUTES } from 'src/app/enums/routes.enum';
import { SessionStorageService } from 'src/app/services/session-storage/session-storage.service';
import { LoginService } from 'src/app/services/login.service';
import { ToastrService } from 'ngx-toastr';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
  animations: [
    trigger('Enter', [
      state('flyIn', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('1.0s ease-out'),
      ]),
    ]),
  ],
})
export class LoginCardComponent implements OnInit, OnDestroy {
  authForm!: FormGroup;
  isResponseValid = false;
  private subscription = new Subscription();
  readonly helpUrl = APP_ROUTES.HELP_URL;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.authForm = this.formBuilder.group({
      userCnic: [
        null,
        [Validators.required, Validators.pattern('^[0-9]{13}$')],
      ],
      userCuin: [null, [Validators.required, Validators.pattern('^[0-9]{7}$')]],
      userPassword: [null, [Validators.required, Validators.maxLength(40)]],
    });
  }

  authenticate() {
    this.isResponseValid = true;
    this.subscription.add(
      this.loginService
        .authenticate(this.authForm.value)
        .pipe(
          tap((res) => {
            this.isResponseValid = false;
            if (res.statusCode === 200) {
              this.sessionStorageService.setData(
                SESSION_STORAGE_KEY.TOKEN,
                res.data.token
              );
              this.sessionStorageService.setData(
                SESSION_STORAGE_KEY.COMPANY_NAME,
                res.data.companyName
              );
              this.sessionStorageService.setData(
                SESSION_STORAGE_KEY.COMPANY_ID,
                res.data.companyId
              );
              this.sessionStorageService.setData(
                SESSION_STORAGE_KEY.USER_CNIC,
                this.authForm.value.userCnic
              );
              this.sessionStorageService.setData(
                SESSION_STORAGE_KEY.USER_CUIN,
                this.authForm.value.userCuin
              );
              this.router.navigateByUrl(APP_ROUTES.HOME_URL);
            } else {
              this.toastService.error(res.message);
            }
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
