import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import pool from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const cookies = req.headers.cookie || "";
  const token = cookies.split("; ").find((c) => c.startsWith("auth_token="))?.split("=")[1];

  // Clear the cookie
  res.setHeader(
    "Set-Cookie",
    serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })
  );

  res.status(200).json({ message: "Logout successful" });
}