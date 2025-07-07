// pages/api/index.js
import { app } from "../../../server";

export default async function handler(req, res) {
  // This ensures Express routes are handled in Vercel
  return app(req, res);
}