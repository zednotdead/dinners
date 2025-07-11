export async function logIn(): Promise<string> {
  const res = await fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'me@zed.gay', password: 'correct horse battery staple' }),
  });

  if (res.ok) {
    const body = await res.json();

    return body.access_token;
  }

  throw new Error('Could not log in', { cause: res });
}
