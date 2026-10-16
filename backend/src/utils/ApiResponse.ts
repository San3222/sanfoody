export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;

  constructor(statusCode: number, data: T, message: string = "Success") {
    this.success = true;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }
}