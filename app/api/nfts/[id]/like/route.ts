import { type NextRequest, NextResponse } from "next/server"
import { likeNFT, unlikeNFT, getNFTLikes } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const nftId = Number.parseInt(params.id)
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    await likeNFT(nftId, walletAddress)
    const likes = await getNFTLikes(nftId, walletAddress)

    return NextResponse.json(likes)
  } catch (error) {
    console.error("Error liking NFT:", error)
    return NextResponse.json({ error: "Failed to like NFT" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const nftId = Number.parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    await unlikeNFT(nftId, walletAddress)
    const likes = await getNFTLikes(nftId, walletAddress)

    return NextResponse.json(likes)
  } catch (error) {
    console.error("Error unliking NFT:", error)
    return NextResponse.json({ error: "Failed to unlike NFT" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const nftId = Number.parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    const likes = await getNFTLikes(nftId, walletAddress || undefined)

    return NextResponse.json(likes)
  } catch (error) {
    console.error("Error getting NFT likes:", error)
    return NextResponse.json({ error: "Failed to get NFT likes" }, { status: 500 })
  }
}
