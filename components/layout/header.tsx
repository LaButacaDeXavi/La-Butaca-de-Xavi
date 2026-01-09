"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {   Menu } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { usePathname } from "next/navigation"


export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Función helper para determinar si un path está activo
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40 select-none">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="text-xl md:text-2xl font-bold text-primary">
              La Butaca de <span className="text-accent">Xavi</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                isActive("/") 
                  ? "text-primary" 
                  : "text-foreground hover:text-primary"
              }`}
            >
              Cartelera
            </Link>
            <Link
              href="/eventos"
              className={`text-sm font-medium transition-colors ${
                isActive("/eventos") 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Eventos
            </Link>
            <Link
              href="/contacto"
              className={`text-sm font-medium transition-colors ${
                isActive("/contacto") 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Contacto
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 md:h-10 md:w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-border/40">
            <Link
              href="/"
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive("/") 
                  ? "text-primary" 
                  : "text-foreground hover:text-primary"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Cartelera
            </Link>
            <Link
              href="/eventos"
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive("/eventos") 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Eventos
            </Link>
            <Link
              href="/teatros"
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive("/teatros") 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Teatros
            </Link>
            <Link
              href="/contacto"
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive("/contacto") 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}