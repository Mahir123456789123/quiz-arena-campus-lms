import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts"

const PerformanceRadarChart = () => {
  // Sample data
  const data = [
    { subject: "Problem Solving", A: 80, fullMark: 100 },
    { subject: "Algorithm Design", A: 65, fullMark: 100 },
    { subject: "Data Structures", A: 75, fullMark: 100 },
    { subject: "System Design", A: 60, fullMark: 100 },
    { subject: "Coding Speed", A: 85, fullMark: 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--foreground)" }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)" }} />
        <Radar name="Student" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default PerformanceRadarChart
