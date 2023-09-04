import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  EventEmitter,
  Output,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, tap } from 'rxjs';
import { RECORD } from 'src/app/constants/app.constant';
import { SESSION_STORAGE_KEY } from 'src/app/enums/session-storage-key.enum';
import { IBrokerSubmission } from 'src/app/models/broker-submission.model';
import { IResponse } from 'src/app/models/response.model';
import { BrokersSubmissionService } from 'src/app/services/brokers-submission.service';
import { SessionStorageService } from 'src/app/services/session-storage/session-storage.service';
import { ValidateFile } from 'src/app/validators/file.validator';
import { ToastrService } from 'ngx-toastr';
import {
  DEBIT_CREDIT_INEQUALITY_ERROR,
  DEBIT_CREDIT_STRING_ERROR,
} from 'src/app/settings/app.settings';

@Component({
  selector: 'app-upload-sheet-modal',
  templateUrl: './upload-sheet-modal.component.html',
  styleUrls: ['./upload-sheet-modal.component.scss'],
})
export class UploadSheetModalComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('hiddenButton') hiddenButton!: ElementRef;
  @ViewChild('myModal') myModal!: ElementRef;
  @ViewChild('closeButton') closeButton!: ElementRef;
  @Output() closeModalEvent = new EventEmitter<boolean>();
  @Output() newSubmissionEvent = new EventEmitter<string>();
  sheetForm!: FormGroup;
  serverResponse!: IResponse;
  isValidResponse = false;
  periodEnded!: string;
  isResponseReceived = true;
  subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private brokerSubmissionService: BrokersSubmissionService,
    private sessionStorageService: SessionStorageService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getPeriodEndedDate();
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

  getPeriodEndedDate() {
    this.subscription.add(
      this.brokerSubmissionService
        .getPeriodEndedDate(
          this.sessionStorageService.getData(SESSION_STORAGE_KEY.USER_CUIN)!
        )
        .pipe(
          tap((res) => {
            res.data && (this.periodEnded = res.data);
          })
        )
        .subscribe()
    );
  }

  handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    this.sheetForm.patchValue({
      sheetUpload: file,
    });
  }

  uploadSheet() {
    this.isResponseReceived = false;
    const formData = new FormData();
    formData.append('sheetUpload', this.sheetForm.get('sheetUpload')?.value);

    this.subscription.add(
      this.brokerSubmissionService
        .uploadSubmission(formData)
        .pipe(
          tap((res) => {
            this.isResponseReceived = true;
            res.statusCode === 200
              ? ((this.serverResponse = res),
                (this.isValidResponse = true),
                this.newSubmissionEvent.emit('uploadEvent'),
                this.toastService.success(res.message))
              : ((this.isValidResponse = false),
                this.toastService.error(res.message));
          })
        )
        .subscribe()
    );
  }

  generatePayload() {
    const payload: IBrokerSubmission = {
      userId: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.USER_CNIC
      )!,
      userPin: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.USER_PIN
      )!,
      recordType: RECORD.TYPE,
      companyId: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.COMPANY_ID
      )!,
      companyName: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.COMPANY_NAME
      )!,
      companyIncno: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.USER_CUIN
      )!,
      submittedBy: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.USER_CNIC
      )!,
      recordCount: RECORD.COUNT,
      periodEnded: this.periodEnded,
      uploadFile: this.sheetForm.get('sheetUpload')!.value,
      totalCredit: this.serverResponse.data.totalCredit,
      totalDebit: this.serverResponse.data.totalDebit,
    };

    const formData = new FormData();

    Object.keys(payload).forEach((item) => {
      formData.append(item, (payload as any)[item]);
    });

    return formData;
  }

  uploadConfirmation() {
    if (this.serverResponse.data.error === true) {
      if (
        typeof this.serverResponse.data.totalCredit !== 'number' ||
        typeof this.serverResponse.data.totalDebit !== 'number'
      ) {
        this.toastService.error(DEBIT_CREDIT_STRING_ERROR);
        return;
      }
      this.toastService.error(DEBIT_CREDIT_INEQUALITY_ERROR);
      return;
    }

    this.isResponseReceived = false;
    const payload = this.generatePayload();

    this.subscription.add(
      this.brokerSubmissionService
        .uploadConfirmation(payload)
        .pipe(
          tap((res) => {
            this.isResponseReceived = true;
            res.statusCode === 200
              ? ((this.isValidResponse = false),
                this.closeButton.nativeElement.click(),
                this.toastService.success(res.message))
              : ((this.isValidResponse = true),
                this.toastService.error(res.message));
            this.newSubmissionEvent.emit('confirmEvent');
          })
        )
        .subscribe()
    );
  }

  closeModal() {
    this.closeModalEvent.emit(false);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
