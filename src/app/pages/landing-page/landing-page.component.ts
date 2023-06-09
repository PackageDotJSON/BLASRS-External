import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  displayModal = false;
  newFiling!: string;

  newSubmission(value: string) {
    this.newFiling = value;
  }

  openModal(value: boolean) {
    this.displayModal = value;
  }

  closeModal(value: boolean) {
    this.displayModal = value;
  }
}
