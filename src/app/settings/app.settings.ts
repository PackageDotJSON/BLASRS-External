import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { JwtInterceptor } from "../services/interceptor/jwt.interceptor";

export const TEMPLATE_FILE_SETTINGS = {
    TYPE: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    MAX_SIZE: 1000000,
    MIN_SIZE: 9285,
    NAME_LENGTH: 40,
};

export const TEMPLATE_REQUEST_RESPONSE_TYPE = 'blob';

export const HTTP_INTERCEPTOR_SETTINGS = {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true
}