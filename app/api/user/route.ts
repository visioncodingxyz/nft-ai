import { NextResponse } from "next/server"
import { getUserByWallet, createUser, updateUser } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const user = await getUserByWallet(wallet)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { walletAddress, username, bio, avatarUrl } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Check if username is taken (if provided)
    if (username) {
      // Validate username format: no spaces or special characters
      const usernameRegex = /^[a-zA-Z0-9_]+$/
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { error: "Username can only contain letters, numbers, and underscores" },
          { status: 400 },
        )
      }

      // Check if username is already taken
      const existingUser = await getUserByWallet(walletAddress)
      if (existingUser && existingUser.username !== username) {
        // Check if another user has this username
        const usernameCheck = await checkUsernameAvailable(username)
        if (!usernameCheck) {
          return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
        }
      }
    }

    // Check if user exists
    const existingUser = await getUserByWallet(walletAddress)

    let user
    if (existingUser) {
      // Update existing user
      user = await updateUser(walletAddress, { username, bio, avatarUrl })
    } else {
      // Create new user
      user = await createUser({ walletAddress, username, bio, avatarUrl })
    }

    return NextResponse.json({ user, success: true })
  } catch (error) {
    console.error("[v0] Create/update user error:", error)
    return NextResponse.json({ error: "Failed to save user profile" }, { status: 500 })
  }
}

async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { sql } = await import("@/lib/db")
  const result = await sql`
    SELECT username FROM users WHERE username = ${username} LIMIT 1
  `
  return result.length === 0
}
