import { ResponsiveHeatMap } from "@nivo/heatmap"

const ActivityHeatmap = () => {
  // Sample data - in a real app, this would come from your API/database
  const data = [
    {
      id: "Monday",
      data: [
        { x: "8-10am", y: 20 },
        { x: "10-12pm", y: 45 },
        { x: "12-2pm", y: 10 },
        { x: "2-4pm", y: 35 },
        { x: "4-6pm", y: 60 },
        { x: "6-8pm", y: 75 },
        { x: "8-10pm", y: 90 },
      ],
    },
    {
      id: "Tuesday",
      data: [
        { x: "8-10am", y: 15 },
        { x: "10-12pm", y: 40 },
        { x: "12-2pm", y: 5 },
        { x: "2-4pm", y: 30 },
        { x: "4-6pm", y: 55 },
        { x: "6-8pm", y: 80 },
        { x: "8-10pm", y: 70 },
      ],
    },
    {
      id: "Wednesday",
      data: [
        { x: "8-10am", y: 25 },
        { x: "10-12pm", y: 50 },
        { x: "12-2pm", y: 15 },
        { x: "2-4pm", y: 40 },
        { x: "4-6pm", y: 65 },
        { x: "6-8pm", y: 85 },
        { x: "8-10pm", y: 95 },
      ],
    },
    {
      id: "Thursday",
      data: [
        { x: "8-10am", y: 10 },
        { x: "10-12pm", y: 35 },
        { x: "12-2pm", y: 5 },
        { x: "2-4pm", y: 25 },
        { x: "4-6pm", y: 50 },
        { x: "6-8pm", y: 70 },
        { x: "8-10pm", y: 85 },
      ],
    },
    {
      id: "Friday",
      data: [
        { x: "8-10am", y: 30 },
        { x: "10-12pm", y: 55 },
        { x: "12-2pm", y: 20 },
        { x: "2-4pm", y: 45 },
        { x: "4-6pm", y: 70 },
        { x: "6-8pm", y: 40 },
        { x: "8-10pm", y: 30 },
      ],
    },
    {
      id: "Saturday",
      data: [
        { x: "8-10am", y: 5 },
        { x: "10-12pm", y: 20 },
        { x: "12-2pm", y: 10 },
        { x: "2-4pm", y: 30 },
        { x: "4-6pm", y: 45 },
        { x: "6-8pm", y: 60 },
        { x: "8-10pm", y: 75 },
      ],
    },
    {
      id: "Sunday",
      data: [
        { x: "8-10am", y: 5 },
        { x: "10-12pm", y: 15 },
        { x: "12-2pm", y: 10 },
        { x: "2-4pm", y: 25 },
        { x: "4-6pm", y: 40 },
        { x: "6-8pm", y: 65 },
        { x: "8-10pm", y: 80 },
      ],
    },
  ]

  return (
    <div className="h-full w-full">
      <h3 className="text-lg font-semibold mb-4 text-center">Weekly Activity Pattern</h3>
      <div className="h-[400px] w-full">
        <ResponsiveHeatMap
          data={data}
          margin={{ top: 30, right: 60, bottom: 80, left: 80 }}
          valueFormat=">-.2s"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 10,
            tickRotation: -45,
            legend: "Time of Day",
            legendPosition: "middle",
            legendOffset: 50,
            tickStrokeWidth: 1,
            tickStroke: "var(--border)",
            legendColor: "var(--foreground)",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 10,
            tickRotation: 0,
            legend: "Day of Week",
            legendPosition: "middle",
            legendOffset: -60,
            tickStrokeWidth: 1,
            tickStroke: "var(--border)",
            legendColor: "var(--foreground)",
          }}
          colors={{
            type: "sequential",
            scheme: "blues",
            minValue: 0,
            maxValue: 100,
          }}
          emptyColor="var(--muted)"
          borderColor="var(--border)"
          borderWidth={1}
          hoverTarget="cell"
          cellOpacity={1}
          label={d => `${d.value} activity units`}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 3]],
          }}
          legends={[
            {
              anchor: "bottom",
              translateX: 0,
              translateY: 60,
              length: 200,
              thickness: 12,
              direction: "row",
              tickPosition: "after",
              tickSize: 5,
              tickSpacing: 4,
              tickOverlap: false,
              title: "Activity Level",
              titleAlign: "start",
              titleOffset: 8,
              titleColor: "var(--foreground)",
            },
          ]}
          annotations={[]}
          theme={{
            text: {
              fontSize: 12,
              fontWeight: 600,
              fill: "var(--foreground)",
            },
            tooltip: {
              container: {
                background: "var(--background)",
                color: "var(--foreground)",
                fontSize: 12,
                padding: "8px 12px",
                borderRadius: 6,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                borderColor: "var(--border)",
                borderWidth: 1,
              },
            },
            axis: {
              domain: {
                line: {
                  stroke: "var(--border)",
                  strokeWidth: 1.5,
                }
              },
              ticks: {
                text: {
                  fontSize: 12,
                  fontWeight: 500,
                  fill: "var(--foreground)",
                },
                line: {
                  stroke: "var(--border)",
                  strokeWidth: 1.5,
                },
              },
              legend: {
                text: {
                  fontSize: 14,
                  fontWeight: 600,
                  fill: "var(--foreground)",
                },
              },
            },
            grid: {
              line: {
                stroke: "var(--border)",
                strokeWidth: 1,
              },
            },
            labels: {
              text: {
                fontSize: 11,
                fontWeight: 600,
                fill: "#ffffff",
              }
            }
          }}
        />
      </div>
      <div className="text-center mt-6 mb-2">
        <p className="text-sm font-medium text-foreground">
          You're most productive on <span className="font-bold text-primary">Wednesday evenings (8-10pm)</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Activity patterns suggest focusing on important tasks during high-energy periods
        </p>
      </div>
    </div>
  )
}

export default ActivityHeatmap