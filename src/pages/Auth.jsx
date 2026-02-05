import { Routes, Route } from 'react-router-dom'
import { Loader } from "@/components/ui/loader"
import { SignIn, SignUp, ClerkLoading } from '@clerk/clerk-react'

export default function Auth() {
  return (
    <main className="!bg-red-400 fixed top-0 left-0 right-0 h-full w-full flex justify-center items-center px-6">
      <ClerkLoading>
        <div className="relative h-[264px] w-[500px] max-w-[300px]">
          <Loader />
        </div>
      </ClerkLoading>
      <Routes>
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
      </Routes>
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
    </main>
  )
}
