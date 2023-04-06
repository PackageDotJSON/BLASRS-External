import { Component, Input, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  @Input() toastColor!: string;
  @Input() toastOperation!: string;
  @Input() toastMessage!: string;

  ngOnInit(): void {
    const toastElement = document.getElementById('toast')!;
    const toast = new bootstrap.Toast(toastElement);

    toast.show();
  }
}
