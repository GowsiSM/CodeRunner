import { Code2, Moon, Sun, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { useTheme } from "./theme-provider"
import fabricLogo from "../assets/fabric.png"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [showWarning, setShowWarning] = useState(true)

  return (
    <div className="flex flex-col">
      {/* Warning Banner */}
      {showWarning && (
        <Alert variant="default" className="rounded-none border-x-0 border-t-0 bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-600 dark:text-amber-400 text-sm">
            <strong>Warning:</strong> Your work is temporary and will be lost when you close this tab. 
            This is a session-based editor — data is not saved to a server.
          </AlertDescription>
          <button
            aria-label="Dismiss warning"
            onClick={() => setShowWarning(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 rounded text-amber-500 hover:bg-amber-500/20 text-lg leading-none"
          >
            ×
          </button>
        </Alert>
      )}

      {/* Navbar */}
      <nav className="border-b bg-background">
        <div className="flex h-14 items-center px-4 container mx-auto">
          <a href="https://fabric-eec.vercel.app" target="_blank" rel="noreferrer" className="mr-4 hover:opacity-80 transition-opacity">
            <img src={fabricLogo} alt="Club Logo" className="h-8 w-auto" />
          </a>
          <div className="flex items-center gap-2 font-bold text-xl mr-auto">
            <Code2 className="h-6 w-6" />
            <span>CodeRunner</span>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10"
            aria-label="Toggle theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </nav>
    </div>
  )
}
