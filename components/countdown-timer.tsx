"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  resetTime: string
  className?: string
}

export function CountdownTimer({ resetTime, className = "" }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const reset = new Date(resetTime).getTime()
      const difference = reset - now

      if (difference <= 0) {
        setTimeRemaining("Resetting...")
        // Reload the page to refresh the generation count
        setTimeout(() => window.location.reload(), 1000)
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [resetTime])

  if (!timeRemaining) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4" />
      <span className="font-mono font-semibold">{timeRemaining}</span>
    </div>
  )
}
