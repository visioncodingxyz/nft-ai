import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { imageUrl, metadata } = await request.json()

    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      return NextResponse.json({ error: "IPFS configuration missing" }, { status: 500 })
    }

    // Upload image to IPFS
    let imageIpfsHash = ""
    if (imageUrl) {
      const imageResponse = await fetch(imageUrl)
      const imageBlob = await imageResponse.blob()

      const imageFormData = new FormData()
      imageFormData.append("file", imageBlob)

      const imageUploadResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
        },
        body: imageFormData,
      })

      if (!imageUploadResponse.ok) {
        throw new Error("Failed to upload image to IPFS")
      }

      const imageData = await imageUploadResponse.json()
      imageIpfsHash = imageData.IpfsHash
    }

    // Upload metadata to IPFS
    const metadataWithImage = {
      ...metadata,
      image: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
    }

    const metadataBlob = new Blob([JSON.stringify(metadataWithImage)], { type: "application/json" })
    const metadataFormData = new FormData()
    metadataFormData.append("file", metadataBlob)

    const metadataUploadResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
      body: metadataFormData,
    })

    if (!metadataUploadResponse.ok) {
      throw new Error("Failed to upload metadata to IPFS")
    }

    const metadataData = await metadataUploadResponse.json()

    return NextResponse.json({
      success: true,
      imageUri: `https://gateway.pinata.cloud/ipfs/${imageIpfsHash}`,
      metadataUri: `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`,
    })
  } catch (error) {
    console.error("IPFS upload error:", error)
    return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 })
  }
}
