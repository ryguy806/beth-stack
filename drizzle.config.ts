import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken:
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTQ3MTk3OTksImlkIjoiYjVlNWY4YzQtNTMzNC0xMWVlLWFjYzktNmEzZWYxNmRhMDUxIn0.9RaVHpquRipdqCL0_IJ4zsl6ZjKDa9terc6XqHpuKDxYo1s2MO9-x9yd28iyyZE4Bq8xOaZt5XhTiqheUtRKAw",
  },
  verbose: true,
  strict: true,
} satisfies Config;
