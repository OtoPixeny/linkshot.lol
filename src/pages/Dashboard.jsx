import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ManageForm from '@/components/ManageForm'
import UserPageLink from '@/components/UserPageLink'
import { useUser } from "@clerk/clerk-react"
import { Mail, Calendar, Crown, RefreshCw } from "lucide-react"
import UserModel from "@/models/user"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const { user } = useUser()
  const { toast } = useToast()
  const [isUpdatingRanks, setIsUpdatingRanks] = useState(false)
  
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

  return (
    <div>
      <UserPageLink />
      <div className="py-5 px-6 md:px-20 lg:px-32 mb-16">
        <div>
          <div className="flex flex-col items-center justify-center gap-4  mt-10 mb-10 ">
            <div className="relative">
              <img
                className="w-24 h-24 rounded-full"
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
          
          {/* Admin Section for Rank Management */}
          <Card className="admin-card mb-8">
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
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdatingRanks ? 'animate-spin' : ''}`} />
                    {isUpdatingRanks ? 'განახლდება...' : 'რანკების განახლება'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ManageForm />
        </div>
      </div>
    </div>
  )
}
