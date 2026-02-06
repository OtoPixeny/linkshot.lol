"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@clerk/clerk-react";
import UserModel from "@/models/user";

export default function UserPageLink() {
  const { user } = useUser();
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id && !username) {
        try {
          const userData = await UserModel.getByUserId(user.id);
          if (userData) {
            setUsername(userData.username);
            setName(userData.name);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          // User might not exist yet, that's okay
        } finally {
          setShow(true);
        }
      }
    };

    loadUserData();
  }, [user, username]);

  return (
    <div className="manage-link px-6 md:px-20 lg:px-32">
      {show && username && (
        <Alert className="mb-6">
          <AlertTitle>შენი სოციალ ფეიჯი</AlertTitle>
          <AlertDescription>
            თქვენი სოციალ ფეიჯის ბმული:{" "}
            <a
              href={`/${username}`}
              className="link-my text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {window.location.origin}/{username}
            </a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
