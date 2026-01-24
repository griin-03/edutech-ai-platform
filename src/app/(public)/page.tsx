import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white">
        <div className="font-bold text-2xl text-blue-600">Edutech AI</div>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-6">
          The Future of Learning <br />
          <span className="text-blue-600">Powered by AI</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-8">
          Experience automated grading, personalized AI tutors, and smart analytics. 
          Designed for modern schools and universities.
        </p>
        <div className="flex gap-4">
           <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700">
              Try Demo Platform
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}