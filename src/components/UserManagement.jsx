import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"
import { Users, Search, Shield, Crown, User, Mail, Calendar, Eye, Edit, Trash2 } from "lucide-react"
import UserModel from "@/models/user"

export default function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await UserModel.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "შეცდომა",
        description: "მომხმარებლების ჩატვირთვა ვერ მოხერხდა",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRankUpdate = async (userId, newRank) => {
    try {
      setIsUpdating(true)
      await UserModel.update(userId, { rank: newRank })
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, rank: newRank } : user
        )
      )
      
      toast({
        title: "წარმატება",
        description: "მომხმარებლის რანკი განახლდა",
      })
    } catch (error) {
      console.error('Error updating rank:', error)
      toast({
        title: "შეცდომა",
        description: "რანკის განახლება ვერ მოხერხდა",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setSelectedUser(null)
    }
  }

  const getRankIcon = (rank) => {
    if (rank?.includes('ადმინისტრატორი')) return <Crown className="w-4 h-4 text-red-500" />
    if (rank?.includes('მოდერატორი')) return <Shield className="w-4 h-4 text-blue-500" />
    if (rank?.includes('სპონსორი')) return <Crown className="w-4 h-4 text-yellow-500" />
    if (rank?.includes('პარტნიორი')) return <Crown className="w-4 h-4 text-purple-500" />
    if (rank?.includes('ბუსტერი')) return <Crown className="w-4 h-4 text-green-500" />
    return <User className="w-4 h-4 text-gray-500" />
  }

  const getRankColor = (rank) => {
    if (rank?.includes('ადმინისტრატორი')) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    if (rank?.includes('მოდერატორი')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    if (rank?.includes('სპონსორი')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    if (rank?.includes('პარტნიორი')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    if (rank?.includes('ბუსტერი')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-12 h-12">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-6 h-6" />
          მომხმარებლების მართვა
        </h2>
        <p className="text-muted-foreground">
          ყველა მომხმარებლის ნახვა და მართვა
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="მოძებნეთ მომხმარებელი სახელით, ელ.ფოსტით ან მეტსახელით..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col items-center text-center">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name || user.username}&background=random`}
                  alt={user.name || user.username}
                  className="w-16 h-16 rounded-full object-cover mb-3"
                />
                <h3 className="font-semibold text-sm">{user.name || user.username}</h3>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRankColor(user.rank)}`}>
                  {getRankIcon(user.rank)}
                  <span>{user.rank || 'მომხმარებელი'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(user.created_at).toLocaleDateString('ka-GE')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{user.views || 0} ნახვა</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUser(user)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  მართვა
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                >
                  <a href={`/${user.username}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                მომხმარებლის მართვა: {selectedUser.name || selectedUser.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedUser.avatar_url || `https://ui-avatars.com/api/?name=${selectedUser.name || selectedUser.username}&background=random`}
                  alt={selectedUser.name || selectedUser.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{selectedUser.name || selectedUser.username}</h3>
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="rank">რანკი</Label>
                <select
                  id="rank"
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                  defaultValue={selectedUser.rank || 'მომხმარებელი'}
                  onChange={(e) => {
                    const newRank = e.target.value
                    if (newRank !== (selectedUser.rank || 'მომხმარებელი')) {
                      handleRankUpdate(selectedUser.id, newRank)
                    }
                  }}
                >
                  <option value="მომხმარებელი">მომხმარებელი</option>
                  <option value="ბუსტერი">ბუსტერი</option>
                  <option value="პარტნიორი">პარტნიორი</option>
                  <option value="სპონსორი">სპონსორი</option>
                  <option value="მოდერატორი">მოდერატორი</option>
                  <option value="ადმინისტრატორი">ადმინისტრატორი</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1"
                >
                  დახურვა
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">მომხმარებლები არ მოიძებნა</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'სცადეთ სხვა საძიებო ტერმინი' : 'სისტემში ჯერ არაა მომხმარებლები'}
          </p>
        </div>
      )}
    </div>
  )
}
