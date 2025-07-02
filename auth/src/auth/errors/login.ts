import { BaseError } from '../../errors/base';
import { type LoginDTOType } from '../dto/login-dto';

export class UserNotFoundError extends BaseError {
  constructor(
    public userPayload: LoginDTOType,
  ) {
    super(404, `Could not find user with email ${userPayload.email}`);
  }
}

export class UserHasNoPasswordError extends BaseError {
  constructor(
    public userPayload: LoginDTOType,
  ) {
    super(401, `User with email ${userPayload.email} has no password set.`);
  }
}

export class InvalidPasswordError extends BaseError {
  constructor() {
    super(403, 'The provided password is invalid.');
  }
}
