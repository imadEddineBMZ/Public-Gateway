import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip }

export const BarChart = ({ children, ...props }: any) => {
  return <RechartsBarChart {...props}>{children}</RechartsBarChart>
}
