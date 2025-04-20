import { ResponsiveLine } from "@nivo/line"
import { useTheme } from "next-themes" // Import theme hook if using next-themes

const CompletionProgressChart = () => {
  // Get current theme to adjust chart colors if using next-themes
  // If not using next-themes, you can remove this and rely on CSS variables
  const { resolvedTheme } = useTheme?.() || { resolvedTheme: 'light' }
  const isDark = resolvedTheme === 'dark'

  // Sample data - in a real app, this would come from your API/database
  const data = [
    {
      id: "Completion Rate",
      data: [
        { x: "Week 1", y: 65 },
        { x: "Week 2", y: 78 },
        { x: "Week 3", y: 82 },
        { x: "Week 4", y: 75 },
        { x: "Week 5", y: 86 },
        { x: "Week 6", y: 91 },
      ],
    },
    {
      id: "Average Time (min)",
      data: [
        { x: "Week 1", y: 45 },
        { x: "Week 2", y: 52 },
        { x: "Week 3", y: 48 },
        { x: "Week 4", y: 38 },
        { x: "Week 5", y: 42 },
        { x: "Week 6", y: 35 },
      ],
    },
  ]

  // Custom colors that work well in both light and dark modes
  const customColors = ['#3b82f6', '#10b981'] // blue and emerald that work in both modes

  return (
    <div style={{ height: 200 }} className="completion-progress-chart">
      <ResponsiveLine
        data={data}
        margin={{ top: 10, right: 120, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Weeks',
          legendOffset: 40,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Value',
          legendOffset: -45,
          legendPosition: 'middle'
        }}
        enableGridX={true}
        enableGridY={true}
        colors={customColors}
        lineWidth={3}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        enableSlices="x"
        crosshairType="cross"
        useMesh={true}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 5,
            itemDirection: 'left-to-right',
            itemWidth: 100,
            itemHeight: 20,
            itemOpacity: 1,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
        theme={{
          // Base text styling - white in dark mode
          textColor: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.85)',
          fontSize: 12,
          
          // Axis styling - pure white in dark mode
          axis: {
            domain: {
              line: {
                stroke: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)',
                strokeWidth: 1
              }
            },
            ticks: {
              text: {
                fill: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.75)',
                fontSize: 12,
                fontWeight: 500
              },
              line: {
                stroke: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)',
                strokeWidth: 1
              }
            },
            legend: {
              text: {
                fill: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.85)',
                fontSize: 13,
                fontWeight: 600
              }
            }
          },
          
          // Grid styling - white grid lines in dark mode
          grid: {
            line: {
              stroke: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              strokeWidth: 1,
              strokeDasharray: '4 4'
            }
          },
          
          // Crosshair styling - white in dark mode
          crosshair: {
            line: {
              stroke: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.5)',
              strokeWidth: 1,
              strokeDasharray: '4 4'
            }
          },
          
          // Tooltip styling
          tooltip: {
            container: {
              background: isDark ? '#1f2937' : '#ffffff',
              color: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.9)',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 4,
              boxShadow: isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
            }
          },
          
          // Legends styling - white text in dark mode
          legends: {
            text: {
              fill: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.85)',
              fontSize: 12,
              fontWeight: 500
            }
          }
        }}
        motionConfig="gentle"
        defs={[
          {
            id: 'gradientA',
            type: 'linearGradient',
            colors: [
              { offset: 0, color: customColors[0], opacity: 0.6 },
              { offset: 100, color: customColors[0], opacity: 0 }
            ]
          },
          {
            id: 'gradientB',
            type: 'linearGradient',
            colors: [
              { offset: 0, color: customColors[1], opacity: 0.6 },
              { offset: 100, color: customColors[1], opacity: 0 }
            ]
          }
        ]}
        fill={[
          { match: { id: 'Completion Rate' }, id: 'gradientA' },
          { match: { id: 'Average Time (min)' }, id: 'gradientB' }
        ]}
        sliceTooltip={({ slice }) => {
          return (
            <div
              style={{
                background: isDark ? '#1f2937' : 'white',
                padding: '9px 12px',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ccc',
                borderRadius: '4px',
                color: isDark ? '#ffffff' : '#000000',
                boxShadow: isDark 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                {slice.points[0].data.x}
              </div>
              {slice.points.map(point => (
                <div
                  key={point.id}
                  style={{
                    padding: '3px 0',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: point.serieColor,
                      borderRadius: '50%',
                      marginRight: 8,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{point.serieId}:</span>
                    <span style={{ fontWeight: 600, marginLeft: 10 }}>{point.data.y}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        }}
      />
      {/* Add a subtle legend at the bottom for clarity */}
      <div className="flex justify-center mt-1 text-xs text-muted-foreground">
        <span className="text-center">Hover over points for detailed values</span>
      </div>
    </div>
  )
}

export default CompletionProgressChart