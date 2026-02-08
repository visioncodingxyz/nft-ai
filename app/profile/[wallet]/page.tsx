import { UserProfile } from "@/components/user-profile"
import { getUserByWallet } from "@/lib/db"

interface ProfilePageProps {
  params: {
    wallet: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUserByWallet(params.wallet)

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile wallet={params.wallet} user={user} />
    </div>
  )
}
