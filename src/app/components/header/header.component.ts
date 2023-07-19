import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from 'src/app/enums/routes.enum';
import { SessionStorageService } from 'src/app/services/session-storage/session-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly helpUrl = APP_ROUTES.HELP_URL;

  constructor(
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) {}

  logOut() {
    this.sessionStorageService.clearSessionStorage();
    this.router.navigateByUrl(APP_ROUTES.LOGIN_URL);
  }
}
