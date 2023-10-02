export interface ILogin {
  userCnic: string;
  userCuin?: string;
  userPassword?: string;
}

export interface IPin extends ILogin {
  userPin: string;
}