"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Menu } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { useCart } from "@/context/cart-context"


export function Header() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { itemCount } = useCart();

  return (
    <header className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Updated brand name and improved mobile responsiveness */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="text-xl md:text-2xl font-bold text-primary">
              La Butaca de <span className="text-accent">Xavi</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Cartelera
            </Link>
            <Link
              href="/eventos"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Eventos
            </Link>
            <Link
              href="/teatros"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Teatros
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Actions - Optimized spacing for mobile */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* ThemeToggle */}
            <ThemeToggle />
            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {itemCount ?? 0}
                </span>
              </Button>
            </Link>
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
              className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Cartelera
            </Link>
            <Link
              href="/eventos"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Eventos
            </Link>
            <Link
              href="/teatros"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Teatros
            </Link>
            <Link
              href="/contacto"
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contacto
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
