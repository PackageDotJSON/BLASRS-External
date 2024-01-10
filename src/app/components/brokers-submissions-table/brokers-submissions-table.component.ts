import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { BrokersSubmissionService } from 'src/app/services/brokers-submission.service';
import { tap } from 'rxjs/operators';
import { DownloadFileService } from 'src/app/services/download-file.service';
import {
  EMPTY_FILE_ERROR,
  TEMPLATE_FILE_SETTINGS,
} from 'src/app/settings/app.settings';
import { Subscription, Observable } from 'rxjs';
import { ISubmission } from 'src/app/models/submissions.model';
import { SESSION_STORAGE_KEY } from 'src/app/enums/session-storage-key.enum';
import { SessionStorageService } from 'src/app/services/session-storage/session-storage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-brokers-submissions-table',
  templateUrl: './brokers-submissions-table.component.html',
  styleUrls: ['./brokers-submissions-table.component.scss'],
})
export class BrokersSubmissionsTableComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() newFiling!: string;
  @Output() openModalEvent = new EventEmitter<boolean>();
  brokerSubmissions$!: Observable<ISubmission[]>;
  private subscription = new Subscription();
  isLoading = true;
  isFileDownloading = false;

  constructor(
    private brokersSubmissionService: BrokersSubmissionService,
    private downloadFileService: DownloadFileService,
    private sessionStorageService: SessionStorageService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchSubmissions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    changes['newFiling']?.currentValue === 'confirmEvent' &&
      this.fetchSubmissions();
  }

  openModal() {
    this.openModalEvent.emit(true);
  }

  fetchSubmissions() {
    this.isLoading = true;
    const payload = {
      userCnic: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.USER_CNIC
      )!,
      userCuin: this.sessionStorageService.getData(
        SESSION_STORAGE_KEY.USER_CUIN
      )!,
    };

    this.brokerSubmissions$ = this.brokersSubmissionService
      .fetchSubmissions(payload)
      .pipe(
        tap((res) => {
          res && (this.isLoading = false);
        })
      );
  }

  downloadExcelTemplate() {
    this.isFileDownloading = true;
    this.subscription.add(
      this.brokersSubmissionService
        .downloadExcelTemplate()
        .pipe(
          tap((res) => {
            this.downloadFileService.downloadFileToDesktop(
              res,
              TEMPLATE_FILE_SETTINGS.TYPE
            );
            this.isFileDownloading = false;
          })
        )
        .subscribe()
    );
  }

  downloadSubmission(uploadId: number) {
    this.isFileDownloading = true;
    this.subscription.add(
      this.brokersSubmissionService
        .downloadSubmission(uploadId)
        .pipe(
          tap((res) => {
            if (res.type === TEMPLATE_FILE_SETTINGS.TYPE) {
              this.downloadFileService.downloadFileToDesktop(
                res,
                TEMPLATE_FILE_SETTINGS.TYPE
              );
            } else {
              this.toastService.error(EMPTY_FILE_ERROR);
            }
            this.isFileDownloading = false;
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
