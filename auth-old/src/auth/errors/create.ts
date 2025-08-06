import { BaseError } from '../../errors/base';

export class UserAlreadyExistsError extends BaseError {
  constructor() {
    super(409, 'User already exists.');
  }
}

export class NotCreatedError extends BaseError {
  constructor() {
    super(500, 'User was not created for some reason');
  }
}
