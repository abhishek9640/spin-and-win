"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const recentActivity = [
  {
    id: 1,
    user: "John Doe",
    action: "Placed a bet",
    amount: "$100",
    timestamp: "2 minutes ago",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "Won game",
    amount: "$250",
    timestamp: "5 minutes ago",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "Requested withdrawal",
    amount: "$500",
    timestamp: "10 minutes ago",
  },
  {
    id: 4,
    user: "Sarah Wilson",
    action: "New registration",
    amount: "-",
    timestamp: "15 minutes ago",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentActivity.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>{activity.user}</TableCell>
              <TableCell>{activity.action}</TableCell>
              <TableCell>{activity.amount}</TableCell>
              <TableCell>{activity.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

