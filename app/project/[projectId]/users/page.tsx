import { listUsers } from '@/lib/workos'
import { UsersPageContent } from './client'

export default async function UsersPage() {
  const allUsers = await listUsers()

  return (
    <UsersPageContent allUsers={allUsers} />
  )
}