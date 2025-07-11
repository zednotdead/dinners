export async function logOut(token: string) {
  if (!token) throw new Error('Token is missing');

  const res = await fetch('http://localhost:8080/logout', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });

  return res.ok;
}
