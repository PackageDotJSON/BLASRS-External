import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  setData(key: string, data: string) {
    sessionStorage.setItem(key, data);
  }

  getData(key: string) {
    return sessionStorage.getItem(key);
  }

  deleteData(key: string) {
    return sessionStorage.removeItem(key);
  }

  clearLocalStorage() {
    sessionStorage.clear();
  }
}
