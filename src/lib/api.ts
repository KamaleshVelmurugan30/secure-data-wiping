// // // src/lib/api.ts
// // export async function api(input: RequestInfo, init: RequestInit = {}, token?: string) {
// //   const headers = new Headers(init.headers || {});
// //   if (token) headers.set("Authorization", `Bearer ${token}`);
// //   if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
// //   const res = await fetch(input, { ...init, headers });
// //   if (!res.ok) throw new Error(await res.text());
// //   return res.json();
// // }
// // src/lib/api.ts
// const BASE = import.meta.env.VITE_API_URL ?? ""; // e.g. "https://api.example.com"

// export async function api(
//   input: RequestInfo | string,
//   init: RequestInit = {},
//   token?: string
// ) {
//   const url =
//     typeof input === "string" && !input.startsWith("http")
//       ? `${BASE}${input}`
//       : (input as string);

//   const headers = new Headers(init.headers || {});
//   // Only set Content-Type when a body is present and not already set
//   const hasBody = init.body != null;
//   if (hasBody && !headers.has("Content-Type")) {
//     headers.set("Content-Type", "application/json");
//   }
//   if (token) {
//     headers.set("Authorization", `Bearer ${token}`);
//   }

//   const res = await fetch(url, {
//     // If using cookie-based sessions, keep this; otherwise you can omit it
//     credentials: "include",
//     ...init,
//     headers,
//   });

//   const text = await res.text();
//   const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

//   if (!res.ok) {
//     // surface server message if present
//     const message =
//       typeof data === "object" && data && "message" in data
//         ? (data as any).message
//         : text || res.statusText;
//     throw new Error(message);
//   }

//   return data;
// }
