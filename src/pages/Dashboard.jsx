import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ManageForm from '@/components/ManageForm'
import MusicManager from '@/components/MusicManager'
import UserManagement from '@/components/UserManagement'
import UserPageLink from '@/components/UserPageLink'
import { useUser } from "@clerk/clerk-react"
import { Mail, Calendar, Crown, RefreshCw, User, Shield, LogOut, Key, Menu, X, ExternalLink, BarChart3, Users, Music, Award } from "lucide-react"
import UserModel from "@/models/user"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useSuccessSound } from "@/hooks/useSuccessSound"

export default function Dashboard() {
  const { user, signOut } = useUser()
  const { toast } = useToast()
  const { analytics, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics()
  const { playSuccessSound } = useSuccessSound()
  const [isUpdatingRanks, setIsUpdatingRanks] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('profile')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [userData, setUserData] = useState(null)

  // Helper function to check if user has admin/moderator permissions
  const hasAdminPermissions = () => {
    const userRank = userData?.rank || ''
    return userRank.includes('ადმინისტრატორი') || userRank.includes('მოდერატორი')
  }

  // Load current access key and user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return
      
      try {
        const userData = await UserModel.getByUserId(user.id)
        setUserData(userData)
        setCurrentPassword(userData?.accessKey || '')
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [user?.id])

  const menuItems = useMemo(() => [
    { id: 'profile', label: 'პროფილი', icon: User },
    { id: 'security', label: 'უსაფრთხოება', icon: Shield },
    { id: 'music', label: 'მუსიკა', icon: Music },
    { id: 'badges', label: 'ბეიჯები', icon: Award },
    ...(hasAdminPermissions() ? [{ id: 'users', label: 'ანგარიშები', icon: Users }] : []),
    { id: 'mypage', label: 'ჩემი ფეიჯი', icon: ExternalLink },
  ], [userData])
  
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

  const handleUpdateRanks = async () => {
    setIsUpdatingRanks(true)
    try {
      const result = await UserModel.updateRanksForTopUsers()
      playSuccessSound(); // Play success sound
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
      playSuccessSound(); // Play success sound
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
      playSuccessSound(); // Play success sound
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
            
            {/* <Card className="admin-card mb-6">
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
            </Card> */}
            
            <ManageForm />
          </>
        )
      case 'music':
        return <MusicManager />
      case 'badges':
        return (
          <div className="max-w-6xl mx-auto mt-6 px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">ჩემი ბეიჯები</h2>
              <p className="text-muted-foreground">თქვენი მიღწევები და სტატუსები</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
              {(() => {
                const userRanks = (userData?.rank || 'მომხმარებელი').split(',').map(r => r.trim()).filter(r => r);
                const getRankIcon = (rank) => {
                  const rankIcons = {
                    "მომხმარებელი": "/rank-img/member.png",
                    "ბუსტერი": "/rank-img/booster.png", 
                    "ადმინისტრატორი": "/rank-img/administrator.png",
                    "მოდერატორი": "/rank-img/moderator.png",
                    "owner": "/rank-img/owner.png",
                    "მფლობელი": "/rank-img/owner.png",
                    "sponsor": "/rank-img/sponsor.png",
                    "სპონსორი": "/rank-img/sponsor.png",
                    "პარტნიორი": "/rank-img/partner.png"
                  };
                  return rankIcons[rank] || rankIcons["მომხმარებელი"];
                };

                const badgeConfig = {
                  'მომხმარებელი': { color: 'green', label: 'მომხმარებელი' },
                  'ადმინისტრატორი': { color: 'blue', label: 'ადმინისტრატორი' },
                  'მოდერატორი': { color: 'lime', label: 'მოდერატორი' },
                  'ბუსტერი': { color: 'orange', label: 'ბუსტერი' },
                  'პარტნიორი': { color: 'orange', label: 'პარტნიორი' },
                  'სპონსორი': { color: 'pink', label: 'სპონსორი' },
                  'ვეტერანი': { color: 'red', label: 'ვეტერანი' },
                  'მფლობელი': { color: 'yellow', label: 'მფლობელი' },
                  'owner': { color: 'yellow', label: 'owner' }
                };

                return userRanks.map((rank, index) => {
                  const config = badgeConfig[rank] || { color: 'indigo', label: rank };
                  const colorClasses = {
                    gray: 'border-gray-900 bg-gray-800 hover:bg-gray-900 text-gray-800 stroke-gray-900',
                    red: 'border-red-900 bg-red-800 hover:bg-red-900 text-red-800 stroke-red-900',
                    blue: 'border-blue-900 bg-blue-800 hover:bg-blue-900 text-blue-800 stroke-blue-900',
                    purple: 'border-purple-900 bg-purple-800 hover:bg-purple-900 text-purple-800 stroke-purple-900',
                    green: 'border-green-900 bg-green-800 hover:bg-green-900 text-green-800 stroke-green-900',
                    yellow: 'border-yellow-900 bg-yellow-800 hover:bg-yellow-900 text-yellow-800 stroke-yellow-900',
                    orange: 'border-orange-900 bg-orange-800 hover:bg-orange-900 text-orange-800 stroke-orange-900',
                    pink: 'border-pink-900 bg-pink-800 hover:bg-pink-900 text-pink-800 stroke-pink-900',
                    indigo: 'border-indigo-900 bg-indigo-800 hover:bg-indigo-900 text-indigo-800 stroke-indigo-900',
                    teal: 'border-teal-900 bg-teal-800 hover:bg-teal-900 text-teal-800 stroke-teal-900',
                    emerald: 'border-emerald-900 bg-emerald-800 hover:bg-emerald-900 text-emerald-800 stroke-emerald-900',
                    lime: 'border-lime-900 bg-lime-800 hover:bg-lime-900 text-lime-800 stroke-lime-900'
                  };

                  return (
                    <div key={index} className={`relative duration-300 group border ${colorClasses[config.color].split(' ')[0]} border-4 overflow-hidden rounded-2xl relative h-60 w-80 ${colorClasses[config.color].split(' ')[1]} p-5 flex flex-col items-start gap-4 mx-auto transform hover:scale-105`}>
                      <div className="text-gray-50">
                        <img 
                          src={getRankIcon(rank)} 
                          alt={config.label}
                          className="w-16 h-16 mb-2"
                          onError={(e) => {
                            console.error('Failed to load rank icon:', getRankIcon(rank));
                            e.target.style.display = 'none';
                          }}
                        />
                        <p className="text-xs">{config.label}</p>
                      </div>
                      <button className={`duration-300 ${colorClasses[config.color].split(' ')[2]} border hover:text-gray-50 bg-gray-50 font-semibold ${colorClasses[config.color].split(' ')[3]} px-3 py-2 flex flex-row items-center gap-3 rounded-[15px]`}>
                        მეტის ნახვა
                        <svg y="0" xmlns="http://www.w3.org/2000/svg" x="0" width="100" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" height="100" className="w-6 h-6 fill-current">
                          <path fill-rule="evenodd" d="M22.1,77.9a4,4,0,0,1,4-4H73.9a4,4,0,0,1,0,8H26.1A4,4,0,0,1,22.1,77.9ZM35.2,47.2a4,4,0,0,1,5.7,0L46,52.3V22.1a4,4,0,1,1,8,0V52.3l5.1-5.1a4,4,0,0,1,5.7,0,4,4,0,0,1,0,5.6l-12,12a3.9,3.9,0,0,1-5.6,0l-12-12A4,4,0,0,1,35.2,47.2Z">
                          </path>
                        </svg>
                      </button>
                      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={`group-hover:scale-125 duration-500 absolute -bottom-0.5 -right-20 w-48 h-48 z-10 -my-2 fill-gray-50 ${colorClasses[config.color].split(' ')[4]}`}>
                        <path stroke-width="5" stroke-miterlimit="10" d="M 50.4 51 C 40.5 49.1 40 46 40 44 v -1.2 a 18.9 18.9 0 0 0 5.7 -8.8 h 0.1 c 3 0 3.8 -6.3 3.8 -7.3 s 0.1 -4.7 -3 -4.7 C 53 4 30 0 22.3 6 c -5.4 0 -5.9 8 -3.9 16 c -3.1 0 -3 3.8 -3 4.7 s 0.7 7.3 3.8 7.3 c 1 3.6 2.3 6.9 4.7 9 v 1.2 c 0 2 0.5 5 -9.5 6.8 S 2 62 2 62 h 60 a 14.6 14.6 0 0 0 -11.6 -11 z" data-name="layer1">
                        </path>
                      </svg>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )
      case 'links':
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold">ბმულების მართვა</h2>
          </div>
        )
      case 'analytics':
        return (
          <div className="max-w-6xl mx-auto mt-6 px-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">ანალისტიკა</h2>
              <p className="text-muted-foreground">თქვენი პროფილის მონაცემები და სტატისტიკა</p>
            </div>
            
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="relative w-12 h-12">
                  <Loader />
                </div>
              </div>
            ) : analyticsError ? (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-red-600 dark:text-red-400">ანალისტიკის ჩატვირთვა ვერ მოხერხდა</p>
                    <Button 
                      onClick={refetchAnalytics} 
                      variant="outline" 
                      className="mt-2"
                    >
                      თავიდან ცდა
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">პროფილის ნახვები</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{analytics.profileViews.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        სულ {analytics.monthlyViews.toLocaleString()} თვეში
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">ბმულების კლიკები</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{analytics.monthlyClicks.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                        კონვერსია {analytics.profileViews > 0 ? Math.round((analytics.monthlyClicks / analytics.profileViews) * 100) : 0}%
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">რანგი</p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">#{analytics.rank}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                          <Crown className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                        {analytics.totalUsers.toLocaleString()} მომხმარებლიდან
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">აქტიურობა</p>
                          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{analytics.activityScore}%</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                        {analytics.activityScore >= 80 ? 'ძალიან კარგი' : analytics.activityScore >= 50 ? 'კარგი' : 'ნორმალური'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        ელემენტების პოპულარობა
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(analytics.linkPopularity).length > 0 ? (
                          Object.entries(analytics.linkPopularity)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 6)
                            .map(([linkType, count]) => {
                              const percentage = analytics.monthlyClicks > 0 ? 
                                Math.round((count / analytics.monthlyClicks) * 100) : 0;
                              const colors = {
                                instagram: 'bg-pink-500',
                                youtube: 'bg-red-500',
                                tiktok: 'bg-black',
                                facebook: 'bg-blue-600',
                                twitter: 'bg-sky-500',
                                github: 'bg-gray-800'
                              };
                              const color = colors[linkType.toLowerCase()] || 'bg-gray-500';
                              
                              return (
                                <div key={linkType} className="flex items-center justify-between">
                                  <span className="text-sm font-medium capitalize">{linkType}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div className={`${color} h-2 rounded-full`} style={{width: `${percentage}%`}}></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{count}</span>
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <p className="text-sm text-muted-foreground">ჯერ არაა კლიკების მონაცემები</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        თვის სტატისტიკა
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">საშუალო დღიური ნახვები</span>
                          <span className="font-semibold">{analytics.avgDailyViews}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">საშუალო დღიური კლიკები</span>
                          <span className="font-semibold">{analytics.avgDailyClicks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">სულ ნახვები</span>
                          <span className="font-semibold">{analytics.profileViews.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">სულ კლიკები</span>
                          <span className="font-semibold">{analytics.monthlyClicks.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      ბოლო აქტივობები
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recentActivity.length > 0 ? (
                        analytics.recentActivity.slice(0, 10).map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                activity.type === 'profile_view' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                              <div>
                                <p className="text-sm font-medium">
                                  {activity.type === 'profile_view' ? 'პროფილი ნახეს' : 
                                   `${activity.linkType || 'ბმულზე'} დაკლიკეს`}
                                </p>
                                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {activity.ipAddress ? activity.ipAddress.substring(0, 8) + '...' : 'N/A'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          ჯერ არაა აქტივობების მონაცემები
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        )
      case 'users':
        return <UserManagement />
      case 'mypage':
        return (
          <div className="max-w-md mx-auto mt-6 px-4">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">ჩემი ფეიჯი</h3>
                    <p className="text-sm text-muted-foreground">
                      ნახეთ თქვენი პროფილი სხვების თვალთახედვით
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-background rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2">თქვენი ფეიჯის ბმული:</p>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-sm font-mono truncate flex-1">
                          /{userData?.username || firstName?.toLowerCase() || 'user'}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const username = userData?.username || firstName?.toLowerCase() || 'user'
                            navigator.clipboard.writeText(`/${username}`)
                            toast({
                              title: "ბმული დაკოპირდა",
                              description: "ბმული წარმატებით დაკოპირდა ბუფერში"
                            })
                          }}
                        >
                          კოპირება
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium"
                    >
                      <a href={`/${userData?.username || firstName?.toLowerCase() || 'user'}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        გახსნა ახალ ფანჯარაში
                      </a>
                    </Button>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>შენიშვნა: ფეიჯის გასახსნელად საჭიროა პროფილის მინიმალური ინფორმაციის დამატება</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      item.id === 'mypage'
                        ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg transform hover:scale-[1.02]'
                        : activeSection === item.id && item.id !== 'logout'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'mypage' && (
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    )}
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
