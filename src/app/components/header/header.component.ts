import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from 'src/app/enums/routes.enum';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  logOut() {
    this.localStorageService.clearLocalStorage();
    this.router.navigateByUrl(APP_ROUTES.LOGIN_URL);
  }
}
