import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DownloadFileService {
  downloadFileToDesktop(data: Blob, type: string): void {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const pwa = window.open(url);

    if (!pwa || pwa.closed || typeof pwa.closed === 'undefined') {
      alert('Please disable your pop up blocker for better experience.');
    }
  }
}
