"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/clerk-react";
import { Loader, Plus, Trash2, GripVertical } from "lucide-react";
import CustomLinkModel from "@/models/customLink";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Loader as CustomLoader } from "@/components/ui/loader";
import { useSuccessSound } from "@/hooks/useSuccessSound";

const availableIcons = [
  { value: "globe", label: "🌐 ვებსაიტი", emoji: "🌐" },
  { value: "instagram", label: "📷 Instagram", emoji: "📷" },
  { value: "facebook", label: "📘 Facebook", emoji: "📘" },
  { value: "twitter", label: "🐦 Twitter", emoji: "🐦" },
  { value: "youtube", label: "📺 YouTube", emoji: "📺" },
  { value: "github", label: "💻 GitHub", emoji: "💻" },
  { value: "linkedin", label: "💼 LinkedIn", emoji: "💼" },
  { value: "tiktok", label: "🎵 TikTok", emoji: "🎵" },
  { value: "spotify", label: "🎵 Spotify", emoji: "🎵" },
  { value: "discord", label: "💬 Discord", emoji: "💬" },
  { value: "telegram", label: "✈️ Telegram", emoji: "✈️" },
  { value: "whatsapp", label: "💚 WhatsApp", emoji: "💚" },
  { value: "email", label: "📧 Email", emoji: "📧" },
  { value: "phone", label: "📞 Phone", emoji: "📞" },
  { value: "mapPin", label: "📍 Location", emoji: "📍" },
  { value: "calendar", label: "📅 Calendar", emoji: "📅" },
  { value: "fileText", label: "📄 Document", emoji: "📄" },
  { value: "download", label: "⬇️ Download", emoji: "⬇️" },
  { value: "shoppingCart", label: "🛒 Shop", emoji: "🛒" },
  { value: "heart", label: "❤️ Donate", emoji: "❤️" },
];

export default function CustomLinksManager() {
  const { toast } = useToast();
  const { user } = useUser();
  const { playSuccessSound } = useSuccessSound();

  const [customLinks, setCustomLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    icon: "globe"
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCustomLinks();
  }, [user?.id]);

  const loadCustomLinks = async () => {
    if (!user?.id) {
      console.log("No user ID available");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Loading custom links for user:", user.id);
      const links = await CustomLinkModel.getByUserId(user.id);
      console.log("Loaded custom links:", links);
      setCustomLinks(links || []);
    } catch (error) {
      console.error("Error loading custom links:", error);
      toast({
        title: "შეცდომა",
        description: "ბმულების ჩატვირთვა ვერ მოხერხდა: " + (error.message || "უცნობი შეცდომა"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ შეავსოთ ყველა ველი",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const result = await CustomLinkModel.create(user.id, newLink);
      if (result) {
        playSuccessSound(); // Play success sound
        setCustomLinks([...customLinks, result]);
        setNewLink({ title: "", url: "", icon: "globe" });
        setShowAddForm(false);
        toast({
          title: "წარმატება",
          description: "ბმული წარმატებით დაემატა",
        });
      }
    } catch (error) {
      console.error("Error adding custom link:", error);
      toast({
        title: "შეცდომა",
        description: "ბმულის დამატება ვერ მოხერხდა",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    setSaving(true);
    try {
      const result = await CustomLinkModel.delete(linkId);
      if (result) {
        playSuccessSound(); // Play success sound
        setCustomLinks(customLinks.filter(link => link.id !== linkId));
        toast({
          title: "წარმატება",
          description: "ბმული წარმატებით წაიშალა",
        });
      }
    } catch (error) {
      console.error("Error deleting custom link:", error);
      toast({
        title: "შეცდომა",
        description: "ბმულის წაშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (iconName) => {
    return Icons[iconName] || Icons.globe;
  };

  if (loading) {
    return (
      <div className="space-y-4 flex flex-col items-center justify-center min-h-[200px]">
        <div className="relative w-12 h-12">
          <CustomLoader />
        </div>
        <p className="text-sm text-muted-foreground">ბმულები იტვირთება...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>პირადი ბმულები</CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            ბმულის დამატება
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-title">სათაური</Label>
                <Input
                  id="link-title"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  placeholder="მაგ: ჩემი პორტფოლიო"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-icon">იკონი</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setNewLink({ ...newLink, icon: icon.value })}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-md border transition-all duration-200 hover:bg-white dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600",
                        newLink.icon === icon.value 
                          ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400" 
                          : "bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                      )}
                    >
                      <span className="text-lg mb-1">{icon.emoji}</span>
                      <span className="text-xs text-center text-gray-600 dark:text-gray-300">{icon.label.replace(/[^\w\sა-ჰ]/gi, '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddLink} disabled={saving}>
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    იტვირთება...
                  </>
                ) : (
                  "დამატება"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewLink({ title: "", url: "", icon: "globe" });
                }}
              >
                გაუქმება
              </Button>
            </div>
          </div>
        )}

        {customLinks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>ჯერ არცერთი პირადი ბმული არ არის დამატებული</p>
            <p className="text-sm mt-2">დააჭირეთ "ბმულის დამატება"-ს ახალი ბმულის შესაქმნელად</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customLinks.map((link) => {
              const Icon = getIcon(link.icon);
              return (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-gray-500 truncate">{link.url}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    disabled={saving}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
