import { useParams } from 'react-router-dom'
import UserSocials from '@/components/UserSocials'

export default function UserProfile() {
  const { username } = useParams()

  return (
    <div>
      <UserSocials userDataName={username} />
    </div>
  )
}
