"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";

export default function CustomLinksTest() {
  const { user } = useUser();
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    if (user?.id) {
      setTestResult(`✅ User authenticated: ${user.id}`);
    } else {
      setTestResult("❌ No user authenticated");
    }
  }, [user]);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Custom Links Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>User Status:</strong> {testResult}</p>
          <p><strong>User Email:</strong> {user?.primaryEmailAddress?.emailAddress || "N/A"}</p>
          <p><strong>User Name:</strong> {user?.firstName || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
