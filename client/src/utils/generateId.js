const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateId() {
  const array = new Uint8Array(10);
  window.crypto.getRandomValues(array);

  let result = "";

  for (let i = 0; i < 10; i++) {
    result += alphabet[array[i] & 31];
  }

  return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 10)}`;
}
