import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { Mail, Calendar, Crown, Users, Music, Award, ExternalLink, Settings, Bell } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import UserModel from '@/models/user'

export default function ProfileCard() {
  const { user } = useUser()
  const { toast } = useToast()
  const [userData, setUserData] = React.useState(null)
  
  React.useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return
      
      try {
        const userData = await UserModel.getByUserId(user.id)
        setUserData(userData)
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [user?.id])
  
  if (!user) return null
  
  const { imageUrl, firstName, lastName, emailAddresses, createdAt } = user
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || firstName || 'User'
  const email = emailAddresses[0]?.emailAddress
  const joinDate = createdAt ? new Date(createdAt).toLocaleDateString('ka-GE', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }) : 'Unknown'
  
  // Get user's display name from userData or fallback to Clerk data
  const displayName = userData?.displayName || fullName || 'User'
  const title = userData?.title || ''

  const handleNotificationClick = () => {
    toast({
      title: "შეტყობინებები",
      description: "ამჟამად ახალი შეტყობინებები არ გაქვს",
    })
  }

  const handleMoreClick = () => {
    const username = userData?.username || firstName?.toLowerCase() || 'user'
    window.open(`/${username}`, '_blank')
  }

  return (
    <div className="profile-card">
      <style jsx>{`
        .profile-card {
          --black: 0, 0%, 0%;
          --white: 0, 0%, 100%;
          --black-muted: 0, 0%, 13%;
          --white-smoke: 0, 0%, 89%;
          --green-light: 0, 0%, 89%;
          --gap: 12px;
          --w-card: 100%;
          --h-card: 180px;
          --p-card: 0.75rem;
          --gap-action: 6px;
          --sz-action: 40px;
          --index-action: 2;
          --round-card: calc(var(--sz-action) / 2 + calc(var(--gap-action) / 2));

          width: var(--w-card);
          height: var(--h-card);
          border-radius: var(--round-card);
          position: relative;
          background-color: var(--color-boxes, hsl(var(--green-light)));
          padding: var(--p-card);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          box-sizing: border-box;
        }

        .corner {
          position: absolute;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          height: auto;
          right: 0;
          top: 0;
          background-color: white;
          z-index: 2;
          border-bottom-left-radius: var(--round-card);
          padding-bottom: var(--gap-action);
          padding-left: var(--gap-action);
          gap: var(--gap-action);
        }

        .corner i[data-corner] {
          position: absolute;
          width: 50%;
          height: 50%;
          z-index: 2;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dark .corner {
          position: absolute;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          height: auto;
          right: 0;
          top: 0;
          background-color: black;
          z-index: 2;
          border-bottom-left-radius: var(--round-card);
          padding-bottom: var(--gap-action);
          padding-left: var(--gap-action);
          gap: var(--gap-action);
        }

        .dark .corner i[data-corner] {
          position: absolute;
          width: 50%;
          height: 50%;
          z-index: 2;
          background-color: black;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .corner i[data-corner]::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          border-top-right-radius: var(--round-card);
          background-color: var(--color-boxes, hsl(var(--green-light)));
          z-index: -1;
        }

        .corner i[data-corner="tl"] {
          top: 0;
          right: 100%;
        }

        .corner i[data-corner="br"] {
          right: 0;
          top: 100%;
        }

        .corner .action {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          height: var(--sz-action);
          min-height: var(--sz-action);
          max-height: var(--sz-action);
          width: var(--sz-action);
          min-width: var(--sz-action);
          max-width: var(--sz-action);
          border: none;
          outline: none;
          transition: all 0.5s ease;
          background-color: hsl(var(--white-smoke));
          color: hsl(var(--black-muted));
          box-shadow:
            rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
            rgba(27, 31, 35, 0.15) 0px 0px 0px 1px,
            rgba(0, 0, 0, 0.07) 0px 1px 2px,
            rgba(0, 0, 0, 0.07) 0px 2px 4px;
        }

        .corner .action:hover {
          background: hsl(var(--green-light));
        }

        .corner .action:hover svg {
          color: white;
        }

        .boxes {
          --sz-img: 40px;
          gap: 12px;
          width: 100%;
          position: relative;
          z-index: 9;
          max-width: 60%;
          height: var(--sz-img);
          display: flex;
          align-items: center;
          flex-direction: row;
        }

        .boxes .caption {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: calc(
            100% - calc(var(--p-card) * 2) -
              calc(var(--sz-action) * var(--index-action)) -
              calc(var(--gap-action) * var(--index-action)) - var(--sz-img) - 16px
          );
          margin-top: 8px;
        }

        .boxes .name {
          font-size: 14px;
          font-weight: 600;
          line-height: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .boxes .as {
          font-size: 12px;
          font-weight: 400;
          line-height: 16px;
          color: hsl(var(--black-muted));
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .box-body {
          --sz-img: 24px;
          gap: 12px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 9;
        }

        .box-body .box-content {
          gap: 12px;
          display: flex;
          align-items: start;
          justify-content: flex-start;
          flex-direction: row;
          position: relative;
        }

        .box-body .caption {
          gap: 4px;
          font-size: 12px;
          line-height: 1.4;
          font-weight: 400;
          display: flex;
          align-items: start;
          flex-direction: column;
        }

        .img {
          font-size: 20px;
          font-weight: 800;
          border-radius: 9999px;
          height: var(--sz-img);
          min-height: var(--sz-img);
          max-height: var(--sz-img);
          width: var(--sz-img);
          min-width: var(--sz-img);
          max-width: var(--sz-img);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: hsl(var(--black-muted), 0);
          border: 1px solid hsl(var(--black-muted), 0);
          cursor: pointer;
          user-select: none;
          -moz-user-select: -moz-none;
        }

        .img svg {
          position: absolute;
          background-size: var(--sz-img);
          height: var(--sz-img);
          min-height: var(--sz-img);
          max-height: var(--sz-img);
          width: var(--sz-img);
          min-width: var(--sz-img);
          max-width: var(--sz-img);
        }

        .box-body .img {
          border-radius: 0;
        }

        .profile-name-overlay {
          position: absolute;
          top: 45px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          text-align: center;
          pointer-events: none;
        }

        .profile-name-text {
          color: #333;
          padding: 15px 8px;
          margin-left:-100%;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }

        .dark .profile-name-text {
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
        }

        .social-links {
          position: absolute;
          top: 75px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 8px;
          pointer-events: auto;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          display:none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .social-link:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 1);
        }

        .dark .social-link {
          background: rgba(0, 0, 0, 0.8);
        }

        .dark .social-link:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        @media (max-width: 768px) {
          .profile-card {
            --h-card: 160px;
            --sz-action: 36px;
            --p-card: 0.5rem;
          }
          
          .boxes .name {
            font-size: 12px;
          }
          
          .boxes .as {
            font-size: 10px;
          }
          
          .profile-name-text {
            font-size: 10px;
            padding: 3px 6px;
          }
        }
      `}</style>

      <div className="corner">
        <i data-corner="tl"></i>
        <i data-corner="br"></i>
        <div data-action="notif" className="action" title="შეტყობინებები" onClick={handleNotificationClick}>
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
            height="20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            ></path>
            <path
              d="M16 8m-3 0a3 3 0 1 0 8 0a3 3 0 1 0 -8 0"
              className="dot"
              fill="red"
            ></path>
          </svg>
        </div>
        <div data-action="more" className="action" title="მეტი" onClick={handleMoreClick}>
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17 7l-11 11"></path>
            <path d="M8 7l9 0l0 9"></path>
          </svg>
        </div>
      </div>

      <figure className="boxes">
        <span className="img">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users className="w-full h-full text-gray-400" />
          )}
        </span>
        <figcaption className="caption">
          <p className="name">{displayName}</p>
          <span className="as" title={title || email}>{title || email}</span>
        </figcaption>
      </figure>

      <div className="profile-name-overlay">
        <p className="profile-name-text">{displayName}</p>
      </div>

      <div className="social-links">
        {userData?.spotify && (
          <a href={userData.spotify} target="_blank" rel="noopener noreferrer" className="social-link" title="Spotify">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 9.235-.6 12.559 1.32.42.239.54.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.539.721.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.261 11.28-1.021 16.56 1.561.539.3.719 1.02.419 1.56-.299.541-1.02.719-1.559.42z"/>
            </svg>
          </a>
        )}
        {userData?.zoom && (
          <a href={userData.zoom} target="_blank" rel="noopener noreferrer" className="social-link" title="Zoom">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#2D8CFF">
              <path d="M11.85 17.25h-5.1c-.6 0-1.05-.45-1.05-1.05v-6.6c0-.6.45-1.05 1.05-1.05h5.1c.6 0 1.05.45 1.05 1.05v6.6c0 .6-.45 1.05-1.05 1.05zm7.5-6.6c0-.6-.45-1.05-1.05-1.05h-3.6v8.7h3.6c.6 0 1.05-.45 1.05-1.05v-6.6z"/>
            </svg>
          </a>
        )}
        {userData?.discord && (
          <a href={userData.discord} target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-892a.077.077 0 0 1 .004-.057a.076.076 0 0 1 .052-.04a13.074 13.074 0 0 1 1.872.892a.077.077 0 0 1 .04.057a12.9 12.9 0 0 0 1.225 1.994a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
        )}
        {userData?.game && (
          <a href={userData.game} target="_blank" rel="noopener noreferrer" className="social-link" title="Game">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF6B6B">
              <path d="M21.58 13.13A2.63 2.63 0 0 1 22 14.37a3.07 3.07 0 0 1-3.09 3.05H4.69A3.07 3.07 0 0 1 1.6 14.37a2.58 2.58 0 0 1 .36-1.24l1.74-3.48a2.63 2.63 0 0 1 2.33-1.44h10.94a2.63 2.63 0 0 1 2.33 1.44l1.74 3.48a2.58 2.58 0 0 1 .36 1.24M7.88 18.3a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m8.24 0a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1M3.72 9.13l1.74-3.48A2.63 2.63 0 0 1 7.79 4.21h8.42a2.63 2.63 0 0 1 2.33 1.44l1.74 3.48"/>
            </svg>
          </a>
        )}
        {userData?.website && (
          <a href={userData.website} target="_blank" rel="noopener noreferrer" className="social-link" title="Website">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </a>
        )}
      </div>

      <div className="box-body">
        <div className="box-content">
          <span className="img">
            <Calendar className="w-full h-full text-gray-600" />
          </span>
          <div className="caption">
            <p>შემოსულია</p>
            <div>
              <p className="text-xs font-semibold">{joinDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
