import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  OnInit,
} from '@angular/core';
import { BrokersSubmissionService } from 'src/app/services/brokers-submission.service';
import { tap } from 'rxjs/operators';
import { DownloadFileService } from 'src/app/services/download-file.service';
import { TEMPLATE_FILE_SETTINGS } from 'src/app/settings/app.settings';
import { Subscription, Observable } from 'rxjs';
import { ISubmission } from 'src/app/models/submissions.model';

@Component({
  selector: 'app-brokers-submissions-table',
  templateUrl: './brokers-submissions-table.component.html',
  styleUrls: ['./brokers-submissions-table.component.scss'],
})
export class BrokersSubmissionsTableComponent implements OnInit, OnDestroy {
  @Output() openModalEvent = new EventEmitter<boolean>();
  brokerSubmissions$!: Observable<ISubmission[]>;
  subscription = new Subscription();
  isLoading = true;

  constructor(
    private brokersSubmissionService: BrokersSubmissionService,
    private downloadFileService: DownloadFileService
  ) {}

  ngOnInit(): void {
    this.fetchSubmissions();
  }

  openModal() {
    this.openModalEvent.emit(true);
  }

  fetchSubmissions() {
    this.brokerSubmissions$ = this.brokersSubmissionService
      .fetchSubmissions()
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
