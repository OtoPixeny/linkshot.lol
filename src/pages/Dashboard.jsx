import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ManageForm from '@/components/ManageForm'
import UserPageLink from '@/components/UserPageLink'
import { useUser } from "@clerk/clerk-react"
import { Mail, Calendar, Crown, RefreshCw, User, Shield, LogOut, Key, Menu, X } from "lucide-react"
import UserModel from "@/models/user"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const { user, signOut } = useUser()
  const { toast } = useToast()
  const [isUpdatingRanks, setIsUpdatingRanks] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')

  // Load current access key on component mount
  useEffect(() => {
    const loadCurrentPassword = async () => {
      if (!user?.id) return
      
      try {
        const userData = await UserModel.getByUserId(user.id)
        setCurrentPassword(userData?.accessKey || '')
      } catch (error) {
        console.error('Error loading current password:', error)
      }
    }
    
    loadCurrentPassword()
  }, [user?.id])
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-12 h-12">
          <Loader />
        </div>
      </div>
    )
  }

  const { imageUrl, firstName, lastName, emailAddresses, createdAt } = user
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || firstName || 'User'
  const email = emailAddresses[0]?.emailAddress
  const clerkUserId = user.id

  const menuItems = [
    { id: 'profile', label: 'პროფილი', icon: User },
    { id: 'security', label: 'უსაფრთხოება', icon: Shield },
    { id: 'logout', label: 'გასვლა', icon: LogOut },
  ]

  const handleUpdateRanks = async () => {
    setIsUpdatingRanks(true)
    try {
      const result = await UserModel.updateRanksForTopUsers()
      toast({
        title: "რანკები განახლდა",
        description: `ტოპ 3 მომხმარებლის რანკები წარმატებით განახლდა`,
      })
    } catch (error) {
      toast({
        title: "შეცდომა",
        description: "რანკების განახლება ვერ მოხერხდა",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingRanks(false)
    }
  }

  const handleMenuClick = (item) => {
    if (item.id === 'logout') {
      handleLogout()
    } else {
      setActiveSection(item.id)
    }
  }

  const handleSetPassword = async () => {
    if (newPassword.length !== 4) {
      toast({
        title: "შეცდომა",
        description: "პაროლი უნდა იყოს ზუსტად 4 სიმბოლო",
        variant: "destructive",
      })
      return
    }

    setIsSettingPassword(true)
    try {
      await UserModel.updateAccessKey(clerkUserId, newPassword)
      setCurrentPassword(newPassword)
      setNewPassword('')
      setShowPasswordForm(false)
      toast({
        title: "წარმატება",
        description: "პაროლი წარმატებით დაყენდა",
      })
    } catch (error) {
      toast({
        title: "შეცდომა",
        description: "პაროლის დაყენება ვერ მოხერხდა",
        variant: "destructive",
      })
    } finally {
      setIsSettingPassword(false)
    }
  }

  const handleRemovePassword = async () => {
    setIsSettingPassword(true)
    try {
      await UserModel.updateAccessKey(clerkUserId, '')
      setCurrentPassword('')
      toast({
        title: "წარმატება",
        description: "პაროლი წაიშალა",
      })
    } catch (error) {
      toast({
        title: "შეცდომა",
        description: "პაროლის წაშლა ვერ მოხერხდა",
        variant: "destructive",
      })
    } finally {
      setIsSettingPassword(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (error) {
      toast({
        title: "შეცდომა",
        description: "გასვლა ვერ მოხერხდა",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'profile':
        return (
          <>
            <div className="flex flex-col items-center justify-center gap-4 mt-6 mb-6 px-4">
              <div className="relative">
                <img
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
                  src={imageUrl}
                  alt={fullName}
                />
              </div>
              
              <div className="text-center">
                <Label className="text-sm font-medium">პროფილის ავატარი</Label>
                <p className="text-xs dark:text-gray-400 text-gray-600 mt-1">
                  ავატარის შეცვლა შეგიძლიათ{" "}
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ნავიგაციიდან
                  </a>
                  <span className="text-red-600"> *</span>
                </p>
              </div>
            </div>
            
            <Card className="admin-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  ადმინისტრირება
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">რანკების მართვა</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      ტოპ 3 მომხმარებელს ავტომატურად ენიჭება "ბუსტერი" რანკი
                    </p>
                    <Button 
                      onClick={handleUpdateRanks}
                      disabled={isUpdatingRanks}
                      className="refresh-rank flex items-center gap-2 w-full sm:w-auto"
                    >
                      <RefreshCw className={`w-4 h-4 ${isUpdatingRanks ? 'animate-spin' : ''}`} />
                      {isUpdatingRanks ? 'განახლდება...' : 'რანკების განახლება'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ManageForm />
          </>
        )
      case 'links':
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold">ბმულების მართვა</h2>
          </div>
        )
      case 'analytics':
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold">ანალიტიკა</h2>
          </div>
        )
      case 'security':
        return (
          <div className="max-w-md mx-auto mt-6 px-4">
            <Card className="password-card">
              <CardContent>
                <div className="password-card space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      პროფილის დაცვა
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      დააყენეთ 4 სიმბოლოიანი პაროლი თქვენი პროფილის დასაცავად
                    </p>
                    
                    {currentPassword ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Key className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700 dark:text-green-300">
                            პროფილი დაცულია: ****
                          </span>
                        </div>
                        <Button 
                          onClick={handleRemovePassword}
                          variant="outline"
                          className="w-full"
                          disabled={isSettingPassword}
                        >
                          {isSettingPassword ? 'მუშავდება...' : 'პაროლის წაშლა'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <Shield className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">
                            პროფილი დაუცველია
                          </span>
                        </div>
                        <Button 
                          onClick={() => setShowPasswordForm(true)}
                          className="w-full"
                        >
                          პაროლის დაყენება
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {showPasswordForm && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800" style={{ marginTop: '10px' }}>
                      <h4 className="font-medium mb-3">ახალი პაროლი</h4>
                      <div className="space-y-3">
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value.slice(0, 4))}
                          placeholder="შეიყვანეთ 4 სიმბოლო"
                          maxLength={4}
                          className="text-center text-lg tracking-widest"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSetPassword}
                            disabled={newPassword.length !== 4 || isSettingPassword}
                            className="flex-1"
                          >
                            {isSettingPassword ? 'მუშავდება...' : 'დაყენება'}
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowPasswordForm(false)
                              setNewPassword('')
                            }}
                            variant="outline"
                            disabled={isSettingPassword}
                          >
                            გაუქმება
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <UserPageLink />
      <div className="all flex min-h-screen px-4 sm:px-6 md:px-20 lg:px-32">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="phone-menu fixed top-4 left-4 z-50 p-2 bg-background border border-border rounded-lg md:hidden"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`sidebar fixed md:relative w-64 border-gray-200 dark:border-gray-700 flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-6">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleMenuClick(item)
                      setIsSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id && item.id !== 'logout'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-[10px]">
          <div className="all-manage h-full py-5 mb-16 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
