import { Progress } from "@/components/ui/progress"

const PerformancePrediction = () => {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg p-3 border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-medium text-sm">Data Structures</p>
            <p className="text-xs text-muted-foreground">Current projected grade: A-</p>
          </div>
          <p className="text-lg font-bold text-emerald-500 dark:text-emerald-400">82%</p>
        </div>
        <Progress value={82} className="h-2 bg-emerald-100 dark:bg-emerald-950">
          <div className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full" />
        </Progress>
        <p className="text-xs text-muted-foreground mt-2">
          You're likely to score above 80% if you maintain your current pace.
        </p>
      </div>

      <div className="bg-card rounded-lg p-3 border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-medium text-sm">Machine Learning</p>
            <p className="text-xs text-muted-foreground">Current projected grade: B</p>
          </div>
          <p className="text-lg font-bold text-amber-500 dark:text-amber-400">75%</p>
        </div>
        <Progress value={75} className="h-2 bg-amber-100 dark:bg-amber-950">
          <div className="h-full bg-amber-500 dark:bg-amber-400 rounded-full" />
        </Progress>
        <p className="text-xs text-muted-foreground mt-2">
          Increasing your quiz completion can improve your final score.
        </p>
      </div>
    </div>
  )
}

export default PerformancePrediction
