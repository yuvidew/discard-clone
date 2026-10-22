import "dotenv/config";
import { defineConfig } from "prisma/config";

// Builds the CLI connection URL from the DB_* variables in .env (password is URL-encoded).
const { DB_HOST, DB_PORT = "3306", DB_USER, DB_PASSWORD = "", DB_NAME } = process.env;
const url = `mysql://${encodeURIComponent(DB_USER ?? "")}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
});
