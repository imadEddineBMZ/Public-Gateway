// Create a separate component for navigation that uses useAuth
// This component will only be rendered AFTER AuthProvider is mounted
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export function MainNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const routes = [
    { href: "/donors", label: "Donneurs" },
    { href: "/hospitals", label: "Hôpitaux" },
    { href: "/requests", label: "Demandes" }
  ];

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-hero-red rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-trust-blue">DonorConnect</span>
        </Link>
        <div className="flex items-center gap-4">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button 
                variant="ghost" 
                className={`text-trust-blue hover:text-hero-red hover:bg-red-50 ${
                  pathname === route.href ? "bg-red-50 text-hero-red" : ""
                }`}
              >
                {route.label}
              </Button>
            </Link>
          ))}
          
          {user ? (
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className={`text-trust-blue hover:text-hero-red hover:bg-red-50 ${
                  pathname === "/dashboard" ? "bg-red-50 text-hero-red" : ""
                }`}
              >
                Tableau de bord
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className={`text-trust-blue hover:text-hero-red hover:bg-red-50 ${
                    pathname === "/login" ? "bg-red-50 text-hero-red" : ""
                  }`}
                >
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  className={`${
                    pathname === "/register" 
                      ? "bg-hero-red/90" 
                      : "bg-hero-red hover:bg-hero-red/90"
                  } text-white`}
                >
                  S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
