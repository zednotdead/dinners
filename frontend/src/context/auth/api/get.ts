export async function getUser(token: string) {
  if (!token) throw new Error('Token is missing');

  const res = await fetch('http://localhost:8080', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });

  if (res.ok) {
    return await res.json();
  }
  return undefined;
}
