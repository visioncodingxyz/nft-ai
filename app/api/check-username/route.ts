import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ available: false, error: "Invalid format" })
    }

    // Check if username exists
    const result = await sql`
      SELECT username FROM users WHERE username = ${username} LIMIT 1
    `

    return NextResponse.json({ available: result.length === 0 })
  } catch (error) {
    console.error("[v0] Check username error:", error)
    return NextResponse.json({ error: "Failed to check username" }, { status: 500 })
  }
}
