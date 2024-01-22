import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.component.html',
  styleUrls: ['./video-modal.component.scss'],
})
export class VideoModalComponent implements AfterViewInit {
  @ViewChild('hiddenButton') hiddenButton!: ElementRef;

  ngAfterViewInit(): void {
    this.hiddenButton.nativeElement.click();
  }
}
