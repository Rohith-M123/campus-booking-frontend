
import { GoogleGenAI, Type } from "@google/genai";
import { Booking, Venue } from "./types";

// Fix: Initializing GoogleGenAI with the required named parameter and direct process.env.API_KEY reference
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSlotSuggestions = async (
  requestedDate: string,
  requestedVenue: Venue,
  existingBookings: Booking[],
  requirements: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 ideal time slots for a ${requirements} on ${requestedDate} at ${requestedVenue.name}. 
      Existing bookings for this venue on this day: ${JSON.stringify(existingBookings)}. 
      Consider typical university hours (9 AM - 5 PM). 
      Provide the response as a JSON array of objects with 'time', 'reason', and 'score' (1-10).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              reason: { type: Type.STRING },
              score: { type: Type.NUMBER }
            },
            required: ["time", "reason", "score"]
          }
        }
      }
    });

    // Fix: Using the 'text' property directly as per Gemini API documentation (it's a getter, not a method)
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

export const predictPeakHours = async (bookings: Booking[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these bookings: ${JSON.stringify(bookings)}, analyze and predict the peak booking hours for the upcoming week. Provide a summary and a recommendation for load balancing.`,
    });
    // Fix: Using the 'text' property directly
    return response.text;
  } catch (error) {
    return "Analysis unavailable at this moment.";
  }
};