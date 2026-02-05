import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function UserAvatar({ user, className = "", fallbackClassName = "" }) {
  if (!user) {
    return (
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${fallbackClassName}`}>
        ?
      </div>
    );
  }

  const firstName = user.firstName || user.first_name || '';
  const lastName = user.lastName || user.last_name || '';
  const fullName = user.fullName || user.full_name || `${firstName} ${lastName}`.trim();
  
  const initials = fullName
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className={`relative ${className}`}>
      <Avatar className="w-full h-full">
        <AvatarImage 
          src={user.imageUrl || user.image_url || user.profileImageUrl} 
          alt={fullName || 'User'}
        />
        <AvatarFallback className={`bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold ${fallbackClassName}`}>
          {initials || '?'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
