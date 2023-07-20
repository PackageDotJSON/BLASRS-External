import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../services/interceptor/jwt.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

export const TEMPLATE_FILE_SETTINGS = {
  TYPE: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  MAX_SIZE: 1000000,
  MIN_SIZE: 9285,
  NAME_LENGTH: 40,
};

export const TEMPLATE_REQUEST_RESPONSE_TYPE = 'blob';
export const DEBIT_CREDIT_INEQUALITY_ERROR =
  'The total Debit amount and the total Credit amount should be equal.';
export const DEBIT_CREDIT_STRING_ERROR =
  'You have entered a character in the numerical column. Kindly fix and upload again.';

export const HTTP_INTERCEPTOR_SETTINGS = {
  provide: HTTP_INTERCEPTORS,
  useClass: JwtInterceptor,
  multi: true,
};

export const LOCATION_STRATEGY = {
  provide: LocationStrategy,
  useClass: HashLocationStrategy,
};

export const INITIAL_LOADING_TIME = 3000;
