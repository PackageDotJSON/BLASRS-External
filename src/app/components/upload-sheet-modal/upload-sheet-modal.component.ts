import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, tap } from 'rxjs';
import { IResponse } from 'src/app/models/response.model';
import { BrokersSubmissionService } from 'src/app/services/brokers-submission.service';
import { ValidateFile } from 'src/app/validators/file.validator';

@Component({
  selector: 'app-upload-sheet-modal',
  templateUrl: './upload-sheet-modal.component.html',
  styleUrls: ['./upload-sheet-modal.component.scss'],
})
export class UploadSheetModalComponent implements OnInit, AfterViewInit {
  @ViewChild('hiddenButton') hiddenButton!: ElementRef;
  @Output() closeModalEvent = new EventEmitter<boolean>();
  sheetForm!: FormGroup;
  serverResponse$!: Observable<IResponse>;
  isValidResponse = false;

  constructor(
    private formBuilder: FormBuilder,
    private brokerSubmissionService: BrokersSubmissionService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  ngAfterViewInit() {
    this.hiddenButton.nativeElement.click();
  }

  createForm() {
    this.sheetForm = this.formBuilder.group({
      sheetUpload: [null, [Validators.required, ValidateFile]],
    });
  }

  handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    this.sheetForm.patchValue({
      sheetUpload: file,
    });
  }

  uploadSheet() {
    const formData = new FormData();
    formData.append('sheetUpload', this.sheetForm.get('sheetUpload')?.value);

    this.serverResponse$ = this.brokerSubmissionService
      .uploadSubmission(formData)
      .pipe(
        tap((res) => {
          res.statusCode === 200
            ? (this.isValidResponse = true)
            : (this.isValidResponse = false);
        })
      );
  }

  closeModal() {
    this.closeModalEvent.emit(false);
  }
}
