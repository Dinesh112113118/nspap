import React, { useState, useCallback } from 'react';
import { generateTelemetryForCoordinates } from '../services/mockData';
import type { LiveTelemetryData } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string, isPadded?: boolean }> = ({ children, className, isPadded = true }) => (
    <div className={`bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl ${isPadded ? 'p-6' : ''} ${className}`}>
        {children}
    </div>
);

const aqiToColor = (aqi: number): string => {
    if (aqi <= 50) return '#22c55e'; // Green
    if (aqi <= 100) return '#facc15'; // Yellow
    if (aqi <= 150) return '#fb923c'; // Orange
    if (aqi <= 200) return '#ef4444'; // Red
    if (aqi <= 300) return '#a855f7'; // Purple
    return '#be123c'; // Maroon
};

const TelemetryItem: React.FC<{label: string; value: string | number; unit?: string;}> = ({label, value, unit}) => (
    <div className="flex justify-between items-baseline p-2 bg-gray-800/50 rounded-md">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="font-mono text-white">{value} <span className="text-gray-500 text-xs">{unit}</span></span>
    </div>
)

const LiveTelemetryPanel: React.FC<{ data: LiveTelemetryData | null }> = ({ data }) => (
    <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Live Telemetry</h2>
        {data ? (
            <div className="space-y-2">
                 <div className="text-center bg-gray-800/50 rounded-lg py-3 mb-3">
                    <p className="text-sm text-gray-400">Region AQI</p>
                    <p className="text-5xl font-bold" style={{ color: aqiToColor(data.aqi) }}>{data.aqi}</p>
                </div>
                <div className="space-y-1.5">
                    <TelemetryItem label="Oxygen (O₂)" value={data.o2.toFixed(2)} unit="%" />
                    <TelemetryItem label="Carbon Monoxide (CO)" value={data.co.toFixed(1)} unit="ppb" />
                    <TelemetryItem label="Sulfur Dioxide (SO₂)" value={data.so2.toFixed(2)} unit="ppb" />
                    <TelemetryItem label="Nitrogen Dioxide (NO₂)" value={data.no2.toFixed(1)} unit="ppb" />
                    <TelemetryItem label="Particulates (PM₂.₅)" value={data.pm25.toFixed(1)} unit="µg/m³" />
                </div>
            </div>
        ) : (
            <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center py-10">
                 <svg className="w-12 h-12 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p>No Region Selected.</p>
                <p className="text-xs mt-1">Click anywhere on the map to analyze.</p>
            </div>
        )}
         <p className="text-xs text-gray-600 mt-4 text-center">Source: Fused Global Sensor Network (Simulated)</p>
    </Card>
);

const MapView: React.FC = () => {
    const [selectedPosition, setSelectedPosition] = useState<{x: number, y: number} | null>(null);
    const [liveData, setLiveData] = useState<LiveTelemetryData | null>(null);

    const handleMapClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
        const svg = event.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        
        setSelectedPosition({ x, y });
        const telemetry = generateTelemetryForCoordinates(x, y);
        setLiveData(telemetry);
    }, []);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Geospatial Analysis</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="relative bg-gray-900/60 border border-gray-700/50 rounded-2xl overflow-hidden aspect-[1000/600] cursor-crosshair">
                        <svg viewBox="0 0 1000 600" className="w-full h-full absolute top-0 left-0" onClick={handleMapClick}>
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <rect width="1000" height="600" fill="#030712" />
                            <image href="https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg" width="1000" height="600" opacity="0.6" preserveAspectRatio="xMidYMid slice" />
                            
                            {/* Selected Location Marker */}
                             {selectedPosition && (
                                <circle cx={selectedPosition.x} cy={selectedPosition.y} r="10" fill="rgba(59, 130, 246, 0.7)" stroke="#fff" strokeWidth="2" style={{ filter: 'url(#glow)', pointerEvents: 'none' }}>
                                   <animate attributeName="r" from="8" to="12" dur="1.5s" begin="0s" repeatCount="indefinite" />
                                   <animate attributeName="opacity" from="0.7" to="1" dur="1.5s" begin="0s" repeatCount="indefinite" />
                                </circle>
                             )}
                        </svg>
                    </div>
                </div>
                
                <div className="lg:col-span-1">
                    <LiveTelemetryPanel data={liveData} />
                </div>
            </div>
        </div>
    );
};

export default MapView;