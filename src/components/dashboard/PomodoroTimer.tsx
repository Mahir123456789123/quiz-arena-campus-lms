import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timer, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      if (isBreak) {
        toast.success('Break time is over! Ready to work?')
        setTimeLeft(25 * 60)
      } else {
        toast.success('Time for a break!')
        setTimeLeft(5 * 60)
      }
      setIsBreak(!isBreak)
      setIsActive(false)
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, isBreak])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(25 * 60)
    setIsBreak(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <Card className="bg-blue-100 dark:bg-blue-600 text-black dark:text-white transition-colors h-[250px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-4xl font-bold mb-4">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground text-black mb-4">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </div>
        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleTimer}
            className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-400 dark:hover:bg-blue-500"
          >
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button
            variant="outline"
            onClick={resetTimer}
            className="dark:border-white dark:text-white dark:hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PomodoroTimer
