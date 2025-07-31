import { CustomError } from 'ts-custom-error';

export abstract class BasePasswordError extends CustomError {
  public static code = 500;
  public code = 500;
}

export class IncorrectPasswordError extends BasePasswordError {
  public static code = 403;
  public code = 403;
  public constructor(
  ) {
    super('Provided password was incorrect.');
  }
}

export class UnknownUserError extends BasePasswordError {
  public static code = 404;
  public code = 404;
  public constructor(
  ) {
    super('The user you\'re trying to log in as does not exist.');
  }
}

export class UnknownLoginError extends BasePasswordError {
  public constructor(
  ) {
    super('Something went wrong, try logging in again later.');
  }
}
