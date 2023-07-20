import { Component } from '@angular/core';
import { SessionStorageService } from './services/session-storage/session-storage.service';
import { SESSION_STORAGE_KEY } from './enums/session-storage-key.enum';
import { INITIAL_LOADING_TIME } from './settings/app.settings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  timeOut = false;

  constructor(private sessionStorageService: SessionStorageService) {
    if (this.sessionStorageService.getData(SESSION_STORAGE_KEY.TOKEN)) {
      this.timeOut = true;
    } else {
      setTimeout(() => {
        this.timeOut = true;
      }, INITIAL_LOADING_TIME);
    }
  }
}
