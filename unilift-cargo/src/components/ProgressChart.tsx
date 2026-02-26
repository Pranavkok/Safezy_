import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formattedDate } from '@/lib';
import { ChecklistProgressType } from '@/types/ehs.types';

const ProgressChart = ({
  checklistProgress,
  totalWeightage
}: {
  checklistProgress: ChecklistProgressType;
  totalWeightage: number;
}) => {
  const data = checklistProgress.progress.map((item, index) => ({
    ...item,
    seq: index + 1
  }));

  return (
    <Card className="w-full rounded">
      <CardHeader>
        <CardTitle>Progress Timeline - February 4, 2025</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
            >
              <Line
                type="monotone"
                dataKey="progress"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
              <XAxis dataKey="seq" tickMargin={10} />
              <YAxis
                domain={[0, totalWeightage]}
                tickFormatter={value => `${value}`}
              />
              <Tooltip
                formatter={value => [`${value}`, 'Weightage']}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return formattedDate(payload[0].payload.date);
                  }
                  return '';
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
