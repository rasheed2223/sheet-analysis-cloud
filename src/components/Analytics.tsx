import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Database, FileText, BarChart3 } from 'lucide-react';

interface AnalyticsProps {
  data: any[][];
}

export const Analytics = ({ data }: AnalyticsProps) => {
  if (!data || data.length < 2) return null;

  const headers = data[0] || [];
  const rows = data.slice(1);

  // Calculate basic statistics
  const totalRows = rows.length;
  const totalColumns = headers.length;
  
  // Get numeric columns for analysis
  const numericColumns = headers.map((header, index) => {
    const values = rows.map(row => parseFloat(row[index])).filter(val => !isNaN(val));
    if (values.length > 0) {
      return {
        name: header,
        index,
        values,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }
    return null;
  }).filter(col => col !== null);

  // Prepare chart data for first numeric column
  const chartData = numericColumns.length > 0 
    ? rows.slice(0, 10).map((row, index) => ({
        name: row[0] || `Row ${index + 1}`,
        value: parseFloat(row[numericColumns[0].index]) || 0
      }))
    : [];

  // Prepare pie chart data
  const pieData = numericColumns.slice(0, 5).map((col, index) => ({
    name: col.name,
    value: col.avg,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }));

  const stats = [
    {
      title: 'Total Rows',
      value: totalRows.toLocaleString(),
      icon: Database,
      color: 'text-chart-1'
    },
    {
      title: 'Total Columns',
      value: totalColumns.toString(),
      icon: FileText,
      color: 'text-chart-2'
    },
    {
      title: 'Numeric Columns',
      value: numericColumns.length.toString(),
      icon: BarChart3,
      color: 'text-chart-3'
    },
    {
      title: 'Data Completeness',
      value: `${Math.round((rows.filter(row => row.some(cell => cell !== null && cell !== '')).length / totalRows) * 100)}%`,
      icon: TrendingUp,
      color: 'text-chart-4'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-primary/10`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Data Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {pieData.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Column Averages</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Statistics */}
      {numericColumns.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Column Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Column</th>
                    <th className="text-left p-2">Average</th>
                    <th className="text-left p-2">Minimum</th>
                    <th className="text-left p-2">Maximum</th>
                    <th className="text-left p-2">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {numericColumns.map((col, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{col.name}</td>
                      <td className="p-2">{col.avg.toFixed(2)}</td>
                      <td className="p-2">{col.min.toFixed(2)}</td>
                      <td className="p-2">{col.max.toFixed(2)}</td>
                      <td className="p-2">{(col.max - col.min).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};