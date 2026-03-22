"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedSection } from "@/components/animated-section"
import { createClient } from "@/lib/supabase/client"
import {
  User,
  Mail,
  BarChart3,
  Crown,
  Settings,
  Bell,
  Shield
} from "lucide-react"

export default function ProfilePage() {
  const [email, setEmail] = useState("")

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
    }

    fetchUser()
  }, [])

  const nameParts = useMemo(() => {
    const local = email.split("@")[0] || ""
    const cleaned = local.replace(/[._-]+/g, " ").trim()
    if (!cleaned) {
      return { first: "", last: "" }
    }

    const parts = cleaned.split(/\s+/)
    return {
      first: parts[0] || "",
      last: parts.slice(1).join(" "),
    }
  }, [email])

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedSection>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <AnimatedSection delay={100} className="lg:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Change Photo
                  </Button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        First Name
                      </label>
                      <Input value={nameParts.first} readOnly />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Last Name
                      </label>
                      <Input value={nameParts.last} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={email} className="pl-10" readOnly />
                    </div>
                  </div>
                  <Button className="glow-primary" disabled>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Stats */}
        <div className="space-y-6">
          <AnimatedSection delay={200}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Analyses</span>
                  <span className="text-lg font-bold text-foreground">24</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Average Score</span>
                  <span className="text-lg font-bold text-chart-3">85</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Best Score</span>
                  <span className="text-lg font-bold text-primary">92</span>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-chart-4" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/30 mb-4">
                  <p className="font-semibold text-foreground">Free Plan</p>
                  <p className="text-sm text-muted-foreground">5 analyses per month</p>
                </div>
                <Button variant="outline" className="w-full">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>

      {/* Settings */}
      <AnimatedSection delay={400}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Notifications</p>
                    <p className="text-xs text-muted-foreground">Email alerts</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Security</p>
                    <p className="text-xs text-muted-foreground">Password & 2FA</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Preferences</p>
                    <p className="text-xs text-muted-foreground">Theme & language</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
