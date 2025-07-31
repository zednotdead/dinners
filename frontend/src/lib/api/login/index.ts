import { IncorrectPasswordError, UnknownLoginError, UnknownUserError } from './errors';

export async function logIn(email: string, password: string): Promise<string> {
  const res = await fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    const body = await res.json();

    return body.access_token;
  }

  console.log(res.status);

  switch (res.status) {
    case 403:
      throw new IncorrectPasswordError();
    case 404:
      throw new UnknownUserError();
    default:
      throw new UnknownLoginError();
  }
}
