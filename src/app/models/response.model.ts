export interface IResponse {
  data?: any | any[];
  statusCode: number;
  message: string;
  error: boolean;
}