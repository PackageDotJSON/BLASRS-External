import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../constants/app.constant';
import { API_ENDPOINTS } from '../enums/api-endpoints.enum';
import { ILogin } from '../models/login.model';
import { IResponse } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  authenticate(data: ILogin) {
    return this.http.post(
      BASE_URL + API_ENDPOINTS.AUTHENTICATE,
      data
    ) as Observable<IResponse>;
  }
}
