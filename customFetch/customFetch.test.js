// ver explicación del código en el post <https://nsp.fedeholc.ar/posts/2024-04-20-promises---ejemplos-de-creaci%C3%B3n-y-uso>

import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import { customFetch } from "./customFetch";
import { mockServer } from "./mockserver.js";

beforeAll(() => mockServer.listen());
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
test("customFetch arroja Error cuando la respuesta de fetch es un código que no es 200-299", async () => {
  let rtaError = "";
  try {
    const rta = await customFetch("https://devolver401.com");
  } catch (error) {
    rtaError = error.message;
  }
  expect(rtaError).toBe("Error inesperado: 401 Unauthorized");
});

test("customFetch arroja Error cuando la respuesta de fetch es error de red", async () => {
  let rta = "";
  try {
    rta = await customFetch("https://devolverErrorDeRed.com");
  } catch (error) {
    rta = error;
  }
  expect(rta).toBe("Error de red: Failed to fetch");
});

test("customFetch envia correctamente la rta", async () => {
  let rta = await customFetch("https://ok.com");

  let rtaOk = await rta.json();

  expect(rtaOk.rta).toBe("todo ok");
});
