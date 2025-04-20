"use client"

import { useEffect, useState } from "react"
import { ResponsivePie } from "@nivo/pie"
import { useTheme } from "next-themes"

const LearningDNAChart = () => {
  const [isClient, setIsClient] = useState(false)
  const { theme } = useTheme()

  useEffect(() => setIsClient(true), [])

  // Pick color based on current theme
  const sectionColor = theme === "dark" ? "#ffffff" : "#000000"

  const data = [
    { id: "Visual Learning", value: 85, color: sectionColor },
    { id: "Reading/Writing", value: 60, color: sectionColor },
    { id: "Auditory", value: 45, color: sectionColor },
    { id: "Social Learning", value: 70, color: sectionColor },
    { id: "Practical", value: 90, color: sectionColor },
    { id: "Quiz Performance", value: 75, color: sectionColor },
  ]

  return (
    <div className="h-full w-full flex flex-col bg-purple-200 dark:bg-zinc-800 rounded-xl p-4 transition-colors">

      <div style={{ height: 220, width: "100%" }}>
        {isClient && (
          <ResponsivePie
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.5}
            padAngle={1}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={{ datum: "data.color" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="var(--foreground)"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="var(--background)"
            motionConfig="gentle"
            theme={{
              labels: {
                text: {
                  fontSize: 12,
                  fill: "var(--foreground)",
                },
              },
              tooltip: {
                container: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                  fontSize: 12,
                  borderRadius: 4,
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                },
              },
            }}
          />
        )}
      </div>
      <div className="flex justify-center items-center flex-col mt-4 space-y-2">
        <div className="bg-violet-500/20 dark:bg-violet-300/30 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-full">
          <p className="font-bold">Strongest: Practical (90%)</p>
        </div>
        <div className="bg-amber-500/20 dark:bg-amber-300/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full">
          <p className="font-bold">Weakest: Auditory (45%)</p>
        </div>
      </div>
    </div>
  )
}

export default LearningDNAChart
