import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <div className="container py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/5 border-neutral-900/10 dark:bg-neutral-950/5 dark:border-neutral-50/10">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Contact Us
              </CardTitle>
              <CardDescription>Have questions? We'd love to hear from you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Name
                  </label>
                  <Input id="name" placeholder="Your name" className="bg-white/5 border-neutral-900/20 dark:bg-neutral-950/5 dark:border-neutral-50/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    className="bg-white/5 border-neutral-900/20 dark:bg-neutral-950/5 dark:border-neutral-50/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="message">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Your message"
                    className="bg-white/5 border-neutral-900/20 dark:bg-neutral-950/5 dark:border-neutral-50/20"
                    rows={5}
                  />
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

