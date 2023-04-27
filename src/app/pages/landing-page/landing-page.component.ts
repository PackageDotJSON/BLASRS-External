import { Component } from '@angular/core';
import { IResponse } from 'src/app/models/response.model';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  displayModal = false;
  newFiling!: string;
  toastValue!: IResponse;

  newSubmission(value: string) {
    this.newFiling = value;
  }

  toastResponse(value: IResponse) {
    this.toastValue = value;
  }

  openModal(value: boolean) {
    this.displayModal = value;
  }

  closeModal(value: boolean) {
    this.displayModal = value;
  }
}
