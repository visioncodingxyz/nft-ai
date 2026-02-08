import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"

const MINT_TOKEN_MINT = "24UBwtKAxBg2vx4Ua3fTkR4UBZtnuvKtY5j22i1HoTAX"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const walletAddress = searchParams.get("address")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("[v0] [SERVER] Checking MINT balance for wallet:", walletAddress)

    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com")

    const walletPublicKey = new PublicKey(walletAddress)
    const mintPublicKey = new PublicKey(MINT_TOKEN_MINT)

    // Get all token accounts for this wallet with the MINT token mint
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
      mint: mintPublicKey,
    })

    if (tokenAccounts.value.length === 0) {
      console.log("[v0] [SERVER] No MINT tokens found for wallet")
      return NextResponse.json({ balance: 0 }, { status: 200 })
    }

    // Get the balance from the parsed token account data
    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0
    console.log("[v0] [SERVER] MINT balance:", balance)

    return NextResponse.json({ balance }, { status: 200 })
  } catch (error) {
    console.error("[v0] [SERVER] Error checking MINT balance:", error)
    return NextResponse.json({ balance: 0 }, { status: 200 })
  }
}
