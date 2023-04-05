import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LOCAL_STORAGE_KEY } from 'src/app/enums/local-storage-key.enum';
import { APP_ROUTES } from 'src/app/enums/routes.enum';
import { IResponse } from 'src/app/models/response.model';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
})
export class LoginCardComponent implements OnInit {
  authForm!: FormGroup;
  isResponseValid = false;
  serverResponse$!: Observable<IResponse>;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private localStorageService: LocalStorageService
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
    this.serverResponse$ = this.loginService
      .authenticate(this.authForm.value)
      .pipe(
        tap((res) => {
          this.isResponseValid = false;
          if (res.statusCode === 200) {
            this.localStorageService.setData(
              LOCAL_STORAGE_KEY.USER_CNIC,
              this.authForm.value.userCnic
            );
            this.localStorageService.setData(
              LOCAL_STORAGE_KEY.USER_CUIN,
              this.authForm.value.userCuin
            );
            this.localStorageService.setData(
              LOCAL_STORAGE_KEY.USER_PIN,
              this.authForm.value.userPin
            );
            this.router.navigateByUrl(APP_ROUTES.HOME_URL);
          }
        })
      );
  }
}
