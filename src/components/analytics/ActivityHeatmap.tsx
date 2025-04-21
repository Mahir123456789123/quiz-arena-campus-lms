import { ResponsiveHeatMap } from "@nivo/heatmap"

const ActivityHeatmap = () => {
  // Sample data - in a real app, this would come from your API/database
  const data = [
    {
      id: "Mon",
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
      id: "Tue",
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
      id: "Wed",
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
      id: "Thu",
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
      id: "Fri",
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
      id: "Sat",
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
      id: "Sun",
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
      <div className="h-[280px] w-full">
        <ResponsiveHeatMap
          data={data}
          margin={{ top: 30, right: 30, bottom: 80, left: 50 }} // Increased bottom margin
          valueFormat=">-.2s"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 10,
            tickRotation: -45, // Rotate labels for better visibility
            legend: "Time of Day",
            legendPosition: "middle",
            legendOffset: 55,
            truncateTickAt: 0, // Ensure full label visibility
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Day",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          colors={{
            type: "sequential",
            scheme: "blues",
            minValue: 0,
            maxValue: 100,
          }}
          emptyColor="#f5f5f5"
          borderColor="#e2e8f0"
          borderWidth={1}
          enableLabels={true}
          labelTextColor="#ffffff"
          cellHoverOthersOpacity={0.25}
          hoverTarget="cell"
          cellOpacity={1}
          cellBorderWidth={1}
          legends={[
            {
              anchor: "bottom",
              translateX: 0,
              translateY: 60, // Adjusted to account for larger bottom margin
              length: 200,
              thickness: 10,
              direction: "row",
              tickPosition: "after",
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              title: "Activity →",
              titleAlign: "start",
              titleOffset: 4,
            },
          ]}
          theme={{
            background: "transparent",
            text: {
              fontSize: 11,
              fill: "#64748b",
              outlineWidth: 0,
              outlineColor: "transparent",
            },
            tooltip: {
              container: {
                background: "white",
                color: "#333333",
                fontSize: 12,
                padding: "8px 12px",
                borderRadius: 6,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              },
            },
            axis: {
              domain: {
                line: {
                  stroke: "#e2e8f0",
                  strokeWidth: 1,
                }
              },
              ticks: {
                text: {
                  fontSize: 10,
                  fill: "#64748b",
                },
                line: {
                  stroke: "#e2e8f0",
                  strokeWidth: 1,
                },
              },
              legend: {
                text: {
                  fontSize: 11,
                  fill: "#64748b",
                },
              },
            },
            labels: {
              text: {
                fontSize: 10,
                fontWeight: 600,
                fill: "#FFFFFF",
              }
            },
            legends: {
              text: {
                fontSize: 10,
                fill: "#64748b",
              },
              title: {
                text: {
                  fontSize: 10,
                  fill: "#64748b",
                  fontWeight: 600,
                },
              },
            }
          }}
          cellComponent={({ cell, borderWidth, enableLabels, textColor, onHover, onLeave, onClick }) => {
            const { data, x, y, width, height, color } = cell;
            return (
              <g transform={`translate(${x}, ${y})`} onClick={onClick} onMouseEnter={onHover} onMouseLeave={onLeave}>
                <rect
                  width={width}
                  height={height}
                  fill={color}
                  strokeWidth={borderWidth}
                  stroke="#FFFFFF"
                />
                {enableLabels && (
                  <text
                    x={width / 2}
                    y={height / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fill: Number(data.formattedValue) > 50 ? "#FFFFFF" : "#334155",
                      fontSize: "10px",
                      fontWeight: "bold",
                      pointerEvents: "none",
                    }}
                  >
                    {data.formattedValue}
                  </text>
                )}
              </g>
            );
          }}
        />
      </div>
    </div>
  )
}

export default ActivityHeatmap