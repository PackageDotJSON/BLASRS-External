import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnChanges {
  @Input() toastColor!: string;
  @Input() toastOperation!: string;
  @Input() toastMessage!: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      const toastElement = document.getElementById('toast')!;
      const toast = new bootstrap.Toast(toastElement);

      toast.show();
    }
  }
}
