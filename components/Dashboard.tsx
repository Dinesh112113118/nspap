import React, { useState, useEffect, useCallback } from 'react';
import { getAetherFitAnalysis } from '../services/geminiService';
import { getMockWeatherData, getMockAqiData, getMockAtmosphericCompositionData, getAqi24HourTrendData } from '../services/mockData';
import type { AetherFitResponse, WeatherData, AtmosphericData } from '../types';
import { RunningIcon, CyclingIcon, HikingIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAuth } from '../contexts/AuthContext';


const AQFA_COLORS: { [key: number]: string } = {
    1: '#ef4444', 2: '#f87171', 3: '#fb923c', 4: '#fbbf24',
    5: '#facc15', 6: '#a3e635', 7: '#4ade80', 8: '#22c55e',
    9: '#10b981', 10: '#059669',
};

const Card: React.FC<{ children: React.ReactNode; className?: string, isPadded?: boolean }> = ({ children, className, isPadded = true }) => (
    <div className={`bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl ${isPadded ? 'p-6' : ''} ${className}`}>
        {children}
    </div>
);

const SkeletonLoader: React.FC<{className?: string}> = ({className}) => <div className={`animate-pulse bg-gray-700/50 rounded-md ${className}`}></div>;

const ActivityButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm font-semibold border
            ${isActive ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border-gray-600/50'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const RadialGauge: React.FC<{ score: number }> = ({ score }) => {
    const color = AQFA_COLORS[Math.round(score)] || '#94a3b8';
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (score / 10) * circumference;

    return (
        <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-700/50" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="60" cy="60" />
                <circle
                    className="transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute text-center">
                <span className="text-5xl font-bold" style={{ color }}>{score.toFixed(1)}</span>
                <p className="text-lg font-semibold tracking-widest" style={{ color }}>AQFA</p>
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [analysis, setAnalysis] = useState<AetherFitResponse | null>(null);
    const [weather] = useState<WeatherData>(getMockWeatherData());
    const [atmosphere] = useState<AtmosphericData>(getMockAtmosphericCompositionData());
    const [aqiTrend] = useState(getAqi24HourTrendData());
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState<'Running' | 'Cycling' | 'Hiking'>(user?.primaryActivity || 'Running');

    const fetchAnalysis = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const aqiData = getMockAqiData();
        aqiData.location = user.location; // Use user's location
        
        const weatherData = getMockWeatherData();
        const result = await getAetherFitAnalysis(selectedActivity, weatherData, aqiData);
        setAnalysis(result);
        setLoading(false);
    }, [selectedActivity, user]);

    useEffect(() => {
        if (user) {
            fetchAnalysis();
        }
    }, [fetchAnalysis, user]);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <h2 className="text-xl font-semibold text-white">AQFA Mission Status: <span className="text-blue-400">{selectedActivity}</span></h2>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                             <ActivityButton label="Running" icon={<RunningIcon className="w-5 h-5"/>} isActive={selectedActivity === 'Running'} onClick={() => setSelectedActivity('Running')} />
                            <ActivityButton label="Cycling" icon={<CyclingIcon className="w-5 h-5"/>} isActive={selectedActivity === 'Cycling'} onClick={() => setSelectedActivity('Cycling')} />
                            <ActivityButton label="Hiking" icon={<HikingIcon className="w-5 h-5"/>} isActive={selectedActivity === 'Hiking'} onClick={() => setSelectedActivity('Hiking')} />
                        </div>
                    </div>
                     <div className="flex flex-col md:flex-row items-center justify-center md:justify-start md:space-x-6 text-center md:text-left">
                        {loading ? <SkeletonLoader className="w-48 h-48 rounded-full" /> : <RadialGauge score={analysis?.aqfaScore || 0} />}
                        <div className="mt-4 md:mt-0">
                             {loading ? (
                                <div className="space-y-2">
                                    <SkeletonLoader className="h-8 w-64"/>
                                    <SkeletonLoader className="h-5 w-72"/>
                                    <SkeletonLoader className="h-4 w-56 mt-2"/>
                                </div>
                             ) : (
                                <>
                                <p className="text-3xl font-bold" style={{color: AQFA_COLORS[Math.round(analysis?.aqfaScore || 0)] || '#94a3b8'}}>{analysis?.summary}</p>
                                <p className="text-gray-400 mt-2">Gemini analysis complete. All systems nominal for proposed activity.</p>
                                <p className="text-xs text-gray-500 mt-3">Source: Fused TEMPO & Ground Sensor Data</p>
                                </>
                             )}
                        </div>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Activity Directives</h2>
                     {loading ? (
                         <div className="space-y-4">
                            <SkeletonLoader className="h-16 w-full"/>
                            <SkeletonLoader className="h-16 w-full"/>
                         </div>
                    ): (
                        <div className="space-y-3">
                            {analysis?.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-center bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                                    <div className="mr-4 text-blue-400">
                                        {rec.activity.toLowerCase().includes('run') ? <RunningIcon className="w-8 h-8"/> : rec.activity.toLowerCase().includes('cycl') ? <CyclingIcon className="w-8 h-8"/> : <HikingIcon className="w-8 h-8"/>}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{rec.activity} @ <span className="text-gray-300">{rec.location}</span></p>
                                        <p className="text-sm text-gray-400">Optimal Window: {rec.time}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold" style={{color: AQFA_COLORS[Math.round(rec.score)]}}>{rec.score.toFixed(1)}</div>
                                        <div className="text-xs text-gray-400">Predicted AQFA</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">24-Hour AQI Trend</h2>
                    <div className="h-60 pr-4">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={aqiTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" strokeOpacity={0.3} />
                            <XAxis dataKey="time" stroke="#a0aec0" fontSize={12} />
                            <YAxis stroke="#a0aec0" fontSize={12} domain={[0, 'dataMax + 20']}/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                    borderColor: '#4a5568',
                                }}
                            />
                            <Legend verticalAlign="top" align="right" wrapperStyle={{top: -10}}/>
                             <ReferenceLine x={aqiTrend[18].time} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Now", position: "insideTop", fill: '#f59e0b' }} />
                            <Line type="monotone" dataKey="aqi" name="Actual" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="prediction" name="Prediction" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Atmospheric Composition</h2>
                     <div className="space-y-3 text-sm">
                        {Object.entries(atmosphere).map(([key, data]) => (
                             <div key={key} className="flex justify-between items-baseline p-2 bg-gray-800/50 rounded-md">
                                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="font-mono text-white">{data.value.toFixed(1)} <span className="text-gray-500">{data.unit}</span></span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-4 text-center">Source: NASA TEMPO Satellite</p>
                </Card>
                 <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Local Telemetry</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm text-center">
                        <div className="bg-gray-800/50 p-3 rounded-lg"><strong className="block text-gray-400 text-xs">Temperature</strong> <span className="text-2xl font-semibold text-white">{weather.temperature}°F</span></div>
                        <div className="bg-gray-800/50 p-3 rounded-lg"><strong className="block text-gray-400 text-xs">Condition</strong> <span className="text-lg font-semibold text-white mt-1">{weather.condition}</span></div>
                        <div className="bg-gray-800/50 p-3 rounded-lg"><strong className="block text-gray-400 text-xs">Humidity</strong> <span className="text-lg font-semibold text-white">{weather.humidity}%</span></div>
                        <div className="bg-gray-800/50 p-3 rounded-lg"><strong className="block text-gray-400 text-xs">Wind</strong> <span className="text-lg font-semibold text-white">{weather.windSpeed} mph</span></div>
                    </div>
                </Card>
                 <Card>
                    <h2 className="text-lg font-semibold text-white mb-4">Pollutant Analysis</h2>
                     {loading ? (
                        <SkeletonLoader className="h-24 w-full" />
                     ): (
                        <div className="space-y-3">
                        {analysis?.pollutantBreakdown.map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg">
                                <span className="font-semibold text-gray-300">{p.pollutant}</span>
                                <span className="text-sm font-bold text-orange-300">{p.level}</span>
                            </div>
                        ))}
                        </div>
                     )}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;