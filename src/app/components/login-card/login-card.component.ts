import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { SESSION_STORAGE_KEY } from 'src/app/enums/session-storage-key.enum';
import { APP_ROUTES } from 'src/app/enums/routes.enum';
import { SessionStorageService } from 'src/app/services/session-storage/session-storage.service';
import { LoginService } from 'src/app/services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
})
export class LoginCardComponent implements OnInit, OnDestroy {
  authForm!: FormGroup;
  isResponseValid = false;
  subscription = new Subscription();
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
      userPin: [null, [Validators.required, Validators.pattern('^[0-9]{4}$')]],
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
              this.sessionStorageService.setData(
                SESSION_STORAGE_KEY.USER_PIN,
                this.authForm.value.userPin
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
