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
import { TEMPLATE_FILE_SETTINGS } from 'src/app/settings/app.settings';
import { Subscription, Observable } from 'rxjs';
import { ISubmission } from 'src/app/models/submissions.model';
import { SESSION_STORAGE_KEY } from 'src/app/enums/session-storage-key.enum';
import { SessionStorageService } from 'src/app/services/session-storage/session-storage.service';
import { IResponse } from 'src/app/models/response.model';

@Component({
  selector: 'app-brokers-submissions-table',
  templateUrl: './brokers-submissions-table.component.html',
  styleUrls: ['./brokers-submissions-table.component.scss'],
})
export class BrokersSubmissionsTableComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() newFiling!: string;
  @Input() toastResponse!: IResponse;
  @Output() openModalEvent = new EventEmitter<boolean>();
  brokerSubmissions$!: Observable<ISubmission[]>;
  subscription = new Subscription();
  isLoading = true;

  constructor(
    private brokersSubmissionService: BrokersSubmissionService,
    private downloadFileService: DownloadFileService,
    private sessionStorageService: SessionStorageService
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
    this.subscription.add(
      this.brokersSubmissionService
        .downloadExcelTemplate()
        .pipe(
          tap((res) => {
            this.downloadFileService.downloadFileToDesktop(
              res,
              TEMPLATE_FILE_SETTINGS.TYPE
            );
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
