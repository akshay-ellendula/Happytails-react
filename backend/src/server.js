import "dotenv/config";

import connect_Db from "./config/config_db.js";
import { createApp } from "./app.js";

const app = createApp();
const port = process.env.PORT || 5001;

connect_Db();

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
