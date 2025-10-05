
import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData, AQIData, AetherFitResponse } from '../types';

// For demo purposes, we'll use a placeholder API key
// In production, you would set this via Vite environment variables (VITE_API_KEY)
const API_KEY = import.meta.env.VITE_API_KEY || 'demo-key';

if (!API_KEY || API_KEY === 'demo-key') {
    console.warn("Using demo mode - API_KEY not set. Set VITE_API_KEY environment variable for full functionality.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        aqfaScore: {
            type: Type.NUMBER,
            description: "A single numerical score from 1-10 representing the Air Quality for Activity (AQFA). 1 is worst, 10 is best."
        },
        summary: {
            type: Type.STRING,
            description: "A short, encouraging, one-sentence summary of the conditions."
        },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    activity: { type: Type.STRING },
                    time: { type: Type.STRING, description: "Recommended time slot, e.g., '6:00 AM - 8:00 AM'" },
                    location: { type: Type.STRING, description: "A specific park or trail name." },
                    score: { type: Type.NUMBER, description: "The AQFA score for this specific recommendation."}
                },
                 required: ["activity", "time", "location", "score"]
            }
        },
        pollutantBreakdown: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    pollutant: { type: Type.STRING, description: "e.g., 'Ozone', 'NO2', 'PM2.5'" },
                    level: { type: Type.STRING, description: "e.g., 'Low', 'Moderate', 'High'" },
                    effect: { type: Type.STRING, description: "A brief description of its effect on physical performance." }
                },
                required: ["pollutant", "level", "effect"]
            }
        }
    },
    required: ["aqfaScore", "summary", "recommendations", "pollutantBreakdown"]
};


export const getAetherFitAnalysis = async (
    activity: string,
    weather: WeatherData,
    aqi: AQIData
): Promise<AetherFitResponse> => {
    try {
        const prompt = `
            As an expert environmental health scientist and athletic performance coach named 'Aether', analyze the following data for a person planning to go ${activity.toLowerCase()} in ${aqi.location}.

            Current Weather:
            - Temperature: ${weather.temperature}°F
            - Condition: ${weather.condition}
            - Humidity: ${weather.humidity}%
            - Wind: ${weather.windSpeed} mph

            Air Quality Data (in ppb for gases, µg/m³ for PM2.5):
            - Ozone (O3): ${aqi.ozone}
            - Nitrogen Dioxide (NO2): ${aqi.no2}
            - Particulate Matter (PM2.5): ${aqi.pm25}

            Based on this data, provide a highly accurate and personalized 'Air Quality for Activity' (AQFA) analysis.
            Your response must be in the required JSON format.
            - The recommendations should be creative, specific to the location, and scientifically grounded.
            - The AQFA score must heavily consider the physiological impact of these specific pollutants on strenuous activities like ${activity.toLowerCase()}.
            - The summary should be professional and actionable.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5, // Slightly lower temperature for more consistent, expert-like responses
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as AetherFitResponse;
        
        // Basic validation
        if (typeof parsedData.aqfaScore !== 'number' || !parsedData.summary || !Array.isArray(parsedData.recommendations)) {
            throw new Error("Invalid data structure received from API.");
        }
        
        return parsedData;

    } catch (error) {
        console.error("Error fetching or parsing Gemini response:", error);
        // Return a fallback response with mock data for demo purposes
        return {
            aqfaScore: 7.5,
            summary: "Demo mode: Air quality conditions are favorable for outdoor activities.",
            recommendations: [
                {
                    activity: "Running",
                    time: "6:00 AM - 8:00 AM",
                    location: "Golden Gate Park",
                    score: 8.2
                },
                {
                    activity: "Cycling",
                    time: "5:00 PM - 7:00 PM", 
                    location: "Embarcadero Trail",
                    score: 7.8
                }
            ],
            pollutantBreakdown: [
                {pollutant: "Ozone", level: "Low", effect: "Minimal impact on respiratory function."},
                {pollutant: "PM2.5", level: "Moderate", effect: "Slight reduction in lung capacity during intense exercise."},
                {pollutant: "NO2", level: "Low", effect: "No significant impact on performance."}
            ],
        };
    }
};