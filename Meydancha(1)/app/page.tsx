'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { HomeSearchBar } from '@/components/home-search-bar'
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Trophy,
  Users,
  TrendingUp,
  Phone,
  Mail,
  Clock,
  Star
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Stadium Background */}
      <section className="relative h-[600px] md:h-[700px] w-full overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80)',
          }}
        >
          {/* Dark Overlay (40-60% opacity) */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                Looking for a place to play football?
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 text-white/95">
                Book football, padel, basketball, and tennis stadiums in minutes
              </p>
              <p className="text-lg md:text-xl text-white/90 italic">
                Your game. Your time. Your meydan.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link href="/fields">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Book Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/fields">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Find a Stadium
                    <Search className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register?role=owner">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Become a Stadium Owner
                    <Trophy className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <HomeSearchBar />
        </div>
      </section>

      {/* Sport-Specific Promotional Sections */}
      <section className="container mx-auto px-4 mt-20 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Choose Your Sport
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Football */}
          <Link href="/fields?sportType=football">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-green-800 text-white p-8 h-[280px] flex flex-col justify-between cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">⚽</div>
                <h3 className="text-2xl font-bold mb-2">Football</h3>
                <p className="text-white/90">Book premium football fields</p>
              </div>
              <ArrowRight className="relative z-10 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Padel */}
          <Link href="/fields?sportType=padel">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 h-[280px] flex flex-col justify-between cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🎾</div>
                <h3 className="text-2xl font-bold mb-2">Padel</h3>
                <p className="text-white/90">Fast-paced padel courts</p>
              </div>
              <ArrowRight className="relative z-10 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Basketball */}
          <Link href="/fields?sportType=basketball">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-orange-800 text-white p-8 h-[280px] flex flex-col justify-between cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🏀</div>
                <h3 className="text-2xl font-bold mb-2">Basketball</h3>
                <p className="text-white/90">Indoor & outdoor courts</p>
              </div>
              <ArrowRight className="relative z-10 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Tennis */}
          <Link href="/fields?sportType=tennis">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-white p-8 h-[280px] flex flex-col justify-between cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🎾</div>
                <h3 className="text-2xl font-bold mb-2">Tennis</h3>
                <p className="text-white/90">Professional tennis courts</p>
              </div>
              <ArrowRight className="relative z-10 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 mt-20 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                {/* Connecting line from center of circle to next step */}
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-primary/50" style={{ transform: 'translateX(2.5rem)' }}></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Choose Sport</h3>
              <p className="text-white/90">
                Select your favorite sport from football, padel, basketball, or tennis
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                {/* Connecting line from center of circle to next step */}
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-primary/50" style={{ transform: 'translateX(2.5rem)' }}></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Select Stadium & Time</h3>
              <p className="text-white/90">
                Pick your preferred location, date, and time slot
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Play & Enjoy</h3>
              <p className="text-white/90">
                Confirm your booking and enjoy your game!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stadium Owner Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 border-2 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Become a Stadium Owner
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  List your sports facilities on MEYDANCHA and reach thousands of players. 
                  Maximize your field utilization and grow your business.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Reach more customers 24/7</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Easy booking management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Increase field occupancy</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Real-time availability tracking</span>
                  </li>
                </ul>
                <Link href="/register?role=owner">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Get Started as Owner
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-6 text-center shadow-md">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">+150%</div>
                    <div className="text-sm text-muted-foreground">More Bookings</div>
                  </div>
                  <div className="bg-background rounded-lg p-6 text-center shadow-md">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-sm text-muted-foreground">Active Players</div>
                  </div>
                  <div className="bg-background rounded-lg p-6 text-center shadow-md">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-muted-foreground">Availability</div>
                  </div>
                  <div className="bg-background rounded-lg p-6 text-center shadow-md">
                    <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section / Footer */}
      <footer className="bg-muted border-t mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-4">MEYDANCHA</h3>
              <p className="text-muted-foreground">
                Your trusted platform for booking sports fields. 
                Find and book the best stadiums in minutes.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/fields" className="text-muted-foreground hover:text-primary transition-colors">
                    Browse Fields
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a 
                    href="mailto:support@meydancha.az" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    support@meydancha.az
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <a 
                    href="tel:+994513808214" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +994 51 380 82 14
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MEYDANCHA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

