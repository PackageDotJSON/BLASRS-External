export interface IResponse {
  data?: unknown[];
  statusCode: number;
  message: string;
  error: boolean;
}
