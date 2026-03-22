"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedSection } from "@/components/animated-section"
import { createClient } from "@/lib/supabase/client"
import {
  User,
  Mail,
  BarChart3,
  Settings,
  Bell,
  Shield
} from "lucide-react"

export default function ProfilePage() {
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      if (!supabase) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      if (user.email) {
        setEmail(user.email)
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      const profileRecord = profile as Record<string, unknown> | null
      const metadataName = (user.user_metadata?.full_name as string | undefined)?.trim()

      if (profileRecord?.full_name && typeof profileRecord.full_name === "string") {
        const fullName = profileRecord.full_name.trim()
        const parts = fullName.split(/\s+/)
        setFirstName(parts[0] || "")
        setLastName(parts.slice(1).join(" "))
        return
      }

      const dbFirst = typeof profileRecord?.first_name === "string" ? profileRecord.first_name : ""
      const dbLast = typeof profileRecord?.last_name === "string" ? profileRecord.last_name : ""
      if (dbFirst || dbLast) {
        setFirstName(dbFirst)
        setLastName(dbLast)
        return
      }

      if (metadataName) {
        const parts = metadataName.split(/\s+/)
        setFirstName(parts[0] || "")
        setLastName(parts.slice(1).join(" "))
        return
      }

      const local = (user.email || "").split("@")[0] || ""
      const cleaned = local.replace(/[._-]+/g, " ").trim()
      const parts = cleaned.split(/\s+/)
      setFirstName(parts[0] || "")
      setLastName(parts.slice(1).join(" "))
    }

    fetchUser()
  }, [])

  const handleSave = async () => {
    const supabase = createClient()
    if (!supabase || !userId) return

    setIsSaving(true)
    setSaveMessage(null)
    setSaveError(null)

    try {
      const fullName = `${firstName} ${lastName}`.trim()

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { full_name: fullName || null },
      })
      if (authUpdateError) throw authUpdateError

      const profileFullNamePayload = {
        id: userId,
        email,
        full_name: fullName || null,
        updated_at: new Date().toISOString(),
      }

      const { error: upsertFullNameError } = await supabase
        .from("profiles")
        .upsert(profileFullNamePayload, { onConflict: "id" })

      if (upsertFullNameError) {
        const profileSplitNamePayload = {
          id: userId,
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          updated_at: new Date().toISOString(),
        }

        const { error: upsertSplitNameError } = await supabase
          .from("profiles")
          .upsert(profileSplitNamePayload, { onConflict: "id" })

        if (upsertSplitNameError) throw upsertSplitNameError
      }

      setSaveMessage("Profile updated successfully.")
    } catch {
      setSaveError("Could not save profile right now. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

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
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Last Name
                      </label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
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
                  <div className="space-y-2">
                    <Button className="glow-primary" disabled={isSaving} onClick={handleSave}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    {saveMessage ? <p className="text-sm text-chart-3">{saveMessage}</p> : null}
                    {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
                  </div>
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
