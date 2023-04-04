import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
})
export class LoginCardComponent implements OnInit {
  authForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService
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
    this.loginService
      .authenticate(this.authForm.value)
      .pipe(
        tap((res) => {
          console.log(res);
        })
      )
      .subscribe();
  }
}
