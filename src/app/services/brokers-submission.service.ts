import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants/app.constant';
import { API_ENDPOINTS } from '../enums/api-endpoints.enum';
import { TEMPLATE_REQUEST_RESPONSE_TYPE } from '../settings/app.settings';
import { ISubmission } from '../models/submissions.model';
import { IResponse } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class BrokersSubmissionService {
  constructor(private http: HttpClient) {}

  fetchSubmissions(payload: { userCnic: string; userCuin: string }) {
    return this.http.get(BASE_URL + API_ENDPOINTS.FETCH_SUBMISSIONS, {
      params: payload,
    }) as Observable<ISubmission[]>;
  }

  downloadExcelTemplate() {
    return this.http.get(BASE_URL + API_ENDPOINTS.DOWNLOAD_EXCEL_TEMPLATE, {
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
}
