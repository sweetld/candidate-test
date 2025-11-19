import React, {useMemo} from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {Task, TaskStatus, TASK_STATUS_CHART_COLORS} from '../types/task';

type StatusFilter = TaskStatus | 'all';

interface TaskAnalyticsDashboardProps {
    tasks: Task[];
    onStatusFilterChange?: (status: StatusFilter) => void;
}

interface StatusChartDatum {
    name: string;
    status: TaskStatus;
    value: number;
}

export const TaskAnalyticsDashboard: React.FC<TaskAnalyticsDashboardProps> = ({
                                                                                  tasks,
                                                                                  onStatusFilterChange,
                                                                              }) => {
    const {
        total,
        completionRate,
        overdueCount,
        statusCounts,
        statusChartData,
    } = useMemo(() => {
        const totalTasks = tasks.length;

        const todo = tasks.filter(t => t.status === TaskStatus.TODO).length;
        const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
        const done = tasks.filter(t => t.status === TaskStatus.DONE).length;

        const completion =
            totalTasks > 0 ? (done / totalTasks) * 100 : 0;

        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
        );

        const overdue = tasks.filter(task => {
            if (!task.dueDate) {
                return false;
            }
            const due = new Date(task.dueDate);
            return due < today && task.status !== TaskStatus.DONE;
        }).length;

        const chartData: StatusChartDatum[] = [
            {name: 'To Do', status: TaskStatus.TODO, value: todo},
            {name: 'In Progress', status: TaskStatus.IN_PROGRESS, value: inProgress},
            {name: 'Done', status: TaskStatus.DONE, value: done},
        ].filter(data => data.value > 0); // hide empty slices

        return {
            total: totalTasks,
            completionRate: completion,
            overdueCount: overdue,
            statusCounts: {todo, inProgress, done},
            statusChartData: chartData,
        };
    }, [tasks]);

    const handleSliceClick = (data: StatusChartDatum) => {
        if (!onStatusFilterChange) {
            return;
        }
        onStatusFilterChange(data.status);
    };

    return (
        <section className="mb-8">
            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white shadow rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700">Total Tasks</h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {total}
                    </p>
                </div>

                <div className="bg-white shadow rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700">Completion Rate</h3>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {completionRate.toFixed(0)}%
                    </p>
                </div>

                <div className="bg-white shadow rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700">Overdue Tasks</h3>
                    <p className="mt-2 text-2xl font-semibold text-red-600">
                        {overdueCount}
                    </p>
                </div>

                <div className="bg-white shadow rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700">
                        Tasks by Status
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">
                        <span className="font-semibold">{statusCounts.todo}</span> To Do ·{' '}
                        <span className="font-semibold">{statusCounts.inProgress}</span> In
                        Progress ·{' '}
                        <span className="font-semibold">{statusCounts.done}</span> Done
                    </p>
                </div>
            </div>

            {/* Donut chart */}
            <div className="bg-white shadow rounded-xl p-4 h-72">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-800">
                        Task Status Distribution
                    </h2>
                    <p className="text-xs text-gray-700">
                        Click a segment to filter the task list
                    </p>
                </div>

                {statusChartData.length === 0 ? (
                    <p className="text-sm text-gray-700">
                        No tasks yet — add some to see analytics.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" className="pb-6">
                        <PieChart>
                            <Pie
                                data={statusChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="50%"
                                outerRadius="80%"
                                paddingAngle={4}
                                onClick={(_, index) => handleSliceClick(statusChartData[index])}
                            >
                                {statusChartData.map(entry => (
                                    <Cell
                                        key={entry.status}
                                        fill={TASK_STATUS_CHART_COLORS[entry.status]}
                                        style={{cursor: onStatusFilterChange ? 'pointer' : 'default'}}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number, _name: string, payload: any) => {
                                    const totalForPct = statusChartData.reduce(
                                        (acc, data) => acc + data.value,
                                        0
                                    );
                                    const pct =
                                        totalForPct > 0
                                            ? ((value / totalForPct) * 100).toFixed(0) + '%'
                                            : '0%';
                                    return [`${value} (${pct})`, payload.payload.name];
                                }}
                            />
                            <Legend verticalAlign="top" align="center">
                            </Legend>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
};
