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
  constructor(
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) {}

  logOut() {
    this.sessionStorageService.clearLocalStorage();
    this.router.navigateByUrl(APP_ROUTES.LOGIN_URL);
  }
}
