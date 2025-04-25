import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

const SimpleBarChart = ({ data, dataKey = 'value', label = 'Prix moyen au m²' }) => {
    const hasEvolution = data.some(item => item.evolution !== undefined);
    const isTimeSeries = data.some(item => !isNaN(parseInt(item.name)));

    const renderTooltip = (value, name) => {
        if (name === label) {
            return [`${value.toLocaleString()} €/m²`, label];
        } else if (name === "Évolution en %") {
            return [`${value.toLocaleString()} %`, "Évolution en %"];
        } else {
            return [value];
        }
    };

    if (isTimeSeries || hasEvolution) {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 30,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        label={{
                            value: 'Année',
                            position: 'insideBottom',
                            offset: -10
                        }}
                    />
                    <YAxis
                        label={{
                            value: label,
                            angle: -90,
                            position: 'insideLeft'
                        }}
                    />
                    <Tooltip
                        formatter={renderTooltip}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name={label}
                        stroke="#2196f3"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                    />
                    {hasEvolution && (
                        <Line
                            type="monotone"
                            dataKey="evolution"
                            name="Évolution en %"
                            stroke="#4caf50"
                            activeDot={{ r: 6 }}
                            strokeWidth={2}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 30,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    fontSize={12}
                />
                <YAxis
                    label={{
                        value: label,
                        angle: -90,
                        position: 'insideLeft'
                    }}
                />
                <Tooltip
                    formatter={renderTooltip}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                    dataKey={dataKey}
                    name={label}
                    fill="#2196f3"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SimpleBarChart;