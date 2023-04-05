import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LOCAL_STORAGE_KEY } from '../enums/local-storage-key.enum';
import { LocalStorageService } from '../services/local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserState implements OnDestroy {
  private isLogin$ = new BehaviorSubject<boolean>(false);

  constructor(private localStorageService: LocalStorageService) {}

  userState() {
    if (this.localStorageService.getData(LOCAL_STORAGE_KEY.USER_CNIC)) {
      this.isLogin$.next(true);
    }
    return this.isLogin$.asObservable();
  }

  ngOnDestroy(): void {
    this.isLogin$.unsubscribe();
  }
}
