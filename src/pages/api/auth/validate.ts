import { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from "jose";
import pool from "@/lib/db";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the JWT token using jose
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    // Extract userId from the token payload
    const userId = payload.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    // Verify if the user exists in the database and is active
    const [rows]: any = await pool.query(
      "SELECT id, role FROM Users WHERE id = ?",
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // User is valid, return authenticated status
    res.status(200).json({ 
      message: "Authenticated",
      user: {
        id: rows[0].id,
        role: rows[0].role
      }
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
}