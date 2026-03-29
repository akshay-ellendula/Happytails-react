import test from "node:test";
import assert from "node:assert/strict";

import { createApp } from "../src/app.js";

test("swagger docs endpoints serve the generated spec and branded UI", async () => {
  const app = createApp({ enableLogging: false, initializePassport: false });
  const server = app.listen(0);

  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  try {
    const { port } = server.address();
    const docsResponse = await fetch(`http://127.0.0.1:${port}/api-docs/`);
    const html = await docsResponse.text();

    assert.equal(docsResponse.status, 200);
    assert.match(html, /HappyTails API Docs/);
    assert.doesNotMatch(html, /undefined/);

    const jsonResponse = await fetch(`http://127.0.0.1:${port}/api-docs.json`);
    const spec = await jsonResponse.json();

    assert.equal(jsonResponse.status, 200);
    assert.equal(spec.info.title, "HappyTails API");
    assert.equal(spec.openapi, "3.0.0");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
