import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://ok.com", () => {
    return HttpResponse.json({
      rta: "todo ok",
    });
  }),
  http.get("https://devolverErrorDeRed.com", () => {
    return HttpResponse.error();
  }),

  http.get("https://devolver401.com", () => {
    return new HttpResponse(null, { status: 401 });
  }),
];
