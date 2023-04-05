import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  setData(key: string, data: string) {
    localStorage.setItem(key, data);
  }

  getData(key: string) {
    return localStorage.getItem(key);
  }

  deleteData(key: string) {
    return localStorage.removeItem(key);
  }

  clearLocalStorage() {
    localStorage.clear();
  }
}
