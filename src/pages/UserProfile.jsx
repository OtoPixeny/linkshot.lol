import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import UserSocials from '@/components/UserSocials'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function UserProfile() {
  const { username } = useParams()
  const { trackView } = useAnalytics()

  useEffect(() => {
    if (username) {
      trackView(username)
    }
  }, [username, trackView])

  return (
    <div>
      <UserSocials userDataName={username} />
    </div>
  )
}
