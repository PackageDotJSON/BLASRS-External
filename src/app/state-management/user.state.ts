import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SESSION_STORAGE_KEY } from '../enums/session-storage-key.enum';
import { SessionStorageService } from '../services/session-storage/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserState implements OnDestroy {
  private isLogin$ = new BehaviorSubject<boolean>(false);

  constructor(private sessionStorageService: SessionStorageService) {}

  userState() {
    this.sessionStorageService.getData(SESSION_STORAGE_KEY.USER_CNIC)
      ? this.isLogin$.next(true)
      : this.isLogin$.next(false);

    return this.isLogin$.asObservable();
  }

  ngOnDestroy(): void {
    this.isLogin$.unsubscribe();
  }
}
