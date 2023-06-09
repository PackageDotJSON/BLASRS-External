import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants/app.constant';
import { API_ENDPOINTS } from '../enums/api-endpoints.enum';
import { TEMPLATE_REQUEST_RESPONSE_TYPE } from '../settings/app.settings';
import { ISubmission } from '../models/submissions.model';
import { IResponse } from '../models/response.model';
import { SessionStorageService } from './session-storage/session-storage.service';
import { SESSION_STORAGE_KEY } from '../enums/session-storage-key.enum';

@Injectable({
  providedIn: 'root',
})
export class BrokersSubmissionService {
  constructor(
    private http: HttpClient,
    private sessionStorage: SessionStorageService
  ) {}

  fetchSubmissions(payload: { userCnic: string; userCuin: string }) {
    return this.http.get(BASE_URL + API_ENDPOINTS.FETCH_SUBMISSIONS, {
      params: payload,
    }) as Observable<ISubmission[]>;
  }

  downloadExcelTemplate() {
    const params = new HttpParams()
      .set(
        'companyName',
        this.sessionStorage.getData(SESSION_STORAGE_KEY.COMPANY_NAME)!
      )
      .set(
        'companyCuin',
        this.sessionStorage.getData(SESSION_STORAGE_KEY.USER_CUIN)!
      );
    return this.http.get(BASE_URL + API_ENDPOINTS.DOWNLOAD_EXCEL_TEMPLATE, {
      params,
      responseType: TEMPLATE_REQUEST_RESPONSE_TYPE,
    }) as Observable<Blob>;
  }

  uploadSubmission(payload: FormData) {
    return this.http.post(
      BASE_URL + API_ENDPOINTS.UPLOAD_SUBMISSION,
      payload
    ) as Observable<IResponse>;
  }

  uploadConfirmation(payload: FormData) {
    return this.http.post(
      BASE_URL + API_ENDPOINTS.UPLOAD_CONFIRMATION,
      payload
    ) as Observable<IResponse>;
  }

  downloadSubmission(uploadId: number) {
    const params = new HttpParams().set('uploadId', uploadId);
    return this.http.get(BASE_URL + API_ENDPOINTS.DOWNLOAD_SUBMISSION, {
      params,
      responseType: TEMPLATE_REQUEST_RESPONSE_TYPE,
    }) as Observable<Blob>;
  }
}
