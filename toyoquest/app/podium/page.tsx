"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../navbar"; 
import Image from "next/image";
import Confetti from "../../confetti";

interface Recommendation {
  rank: number;
  base_model: string;
  trim_name: string;
  reason?: string;
}

// List of all available vehicle image filenames (without .png extension)
const AVAILABLE_IMAGES = [
  "4Runner Limited i-FORCE MAX", "4Runner Limited", "4Runner Platinum", "4Runner SR5",
  "4Runner Trailhunter", "4Runner TRD Off-Road i-FORCE MAX", "4Runner TRD Off-Road Premium i-FORCE MAX",
  "4Runner TRD Off-Road Premium", "4Runner TRD Off-Road", "4Runner TRD Pro", "4Runner TRD Sport Premium",
  "4Runner TRD Sport", "BZ Limited", "BZ XLE", "Camry LE", "Camry Nightshade", "Camry SE", "Camry XLE",
  "Camry XSE", "Corolla Cross Hybrid S", "Corolla Cross Hybrid SE", "Corolla Cross Hybrid XSE",
  "Corolla Cross L", "Corolla Cross LE", "Corolla Cross XLE", "Corolla Hatchback FX", "Corolla Hatchback SE",
  "Corolla Hatchback XSE", "Corolla Hybrid LE", "Corolla Hybrid SE", "Corolla Hybrid XLE", "Corolla LE",
  "Corolla SE", "Corolla XSE", "Crown Signia Limited", "Crown Signia XLE", "GR 86 GR86", "GR Corolla Premium Plus",
  "GR Corolla", "GR Supra 3.0 Premium", "GR Supra 3.0", "GR Supra MkV Final Edition", "GR86 Premium",
  "GR86 Yuzu Edition", "Grand Highlander Hybrid LE", "Grand Highlander Hybrid Limited",
  "Grand Highlander Hybrid MAX Limited", "Grand Highlander Hybrid MAX Platinum", "Grand Highlander Hybrid Nightshade",
  "Grand Highlander Hybrid XLE", "Grand Highlander LE", "Grand Highlander Limited", "Grand Highlander Platinum",
  "Grand Highlander XLE", "Highlander Hybrid Limited", "Highlander Hybrid Platinum", "Highlander Hybrid XLE",
  "Highlander Limited", "Highlander Platinum", "Highlander XLE", "Highlander XSE", "Land Cruiser Land Cruiser 1958",
  "Land Cruiser Land Cruiser", "Mirai XLE", "Prius LE", "Prius Limited", "Prius Nightshade Edition",
  "Prius Plug-in Hybrid Nightshade Edition", "Prius Plug-in Hybrid SE", "Prius Plug-in Hybrid XSE Premium",
  "Prius Plug-in Hybrid XSE", "Prius XLE", "RAV4 Hybrid LE", "RAV4 Hybrid Limited", "RAV4 Hybrid SE",
  "RAV4 Hybrid Woodland Edition", "RAV4 Hybrid XLE prem", "RAV4 Hybrid XLE", "RAV4 Hybrid XSE", "RAV4 LE",
  "RAV4 Limited", "RAV4 Plug-in Hybrid SE", "RAV4 Plug-in Hybrid XSE", "RAV4 XLE prem", "RAV4 XLE",
  "Sequoia 1794 Edition", "Sequoia Capstone", "Sequoia Limited", "Sequoia Platinum", "Sequoia SR5",
  "Sequoia TRD Pro", "Sienna LE", "Sienna Limited", "Sienna Platinum", "Sienna Woodland Edition", "Sienna XLE",
  "Sienna XSE", "Tacoma Limited i-FORCE MAX", "Tacoma Limited", "Tacoma SR", "Tacoma SR5", "Tacoma Trailhunter",
  "Tacoma TRD Off-Road i-FORCE MAX", "Tacoma TRD PreRunner", "Tacoma TRD Pro", "Tacoma TRD Sport i-FORCE MAX",
  "Tacoma TRD Sport", "Toyota Crown Limited", "Toyota Crown NightShade", "Toyota Crown Platinum", "Toyota Crown XLE",
  "TRD Off-Road", "Tundra 1794 Edition i-FORCE MAX", "Tundra 1794 Edition", "Tundra Capstone",
  "Tundra Limited i-FORCE MAX", "Tundra Limited", "Tundra Platinum i-FORCE MAX", "Tundra Platinum", "Tundra SR",
  "Tundra SR5", "Tundra TRD Pro"
];

// Normalize string for comparison (lowercase, remove special chars, normalize spaces)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity score between two strings (0-1, higher is more similar)
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  
  // Exact match
  if (norm1 === norm2) return 1.0;
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;
  
  // Calculate word overlap
  const words1 = new Set(norm1.split(/\s+/));
  const words2 = new Set(norm2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  
  const wordOverlap = intersection.size / union.size;
  
  // Calculate character-level similarity (simple Levenshtein-like)
  const longer = norm1.length > norm2.length ? norm1 : norm2;
  const shorter = norm1.length > norm2.length ? norm2 : norm1;
  
  if (longer.length === 0) return 1.0;
  
  // Count matching characters in order
  let matches = 0;
  let shorterIdx = 0;
  for (let i = 0; i < longer.length && shorterIdx < shorter.length; i++) {
    if (longer[i] === shorter[shorterIdx]) {
      matches++;
      shorterIdx++;
    }
  }
  
  const charSimilarity = matches / longer.length;
  
  // Combine word and character similarity (weight word overlap more)
  return (wordOverlap * 0.7) + (charSimilarity * 0.3);
}

// Find the best matching image filename
function findBestMatch(baseModel: string, trimName: string): string {
  const modelName = baseModel.trim();
  const trim = trimName.trim();
  
  // Try exact matches first with different variations
  const variations = [
    `${modelName} ${trim}`,
    modelName.replace(/^Toyota\s+/i, "") + ` ${trim}`,
    `Toyota ${modelName.replace(/^Toyota\s+/i, "")} ${trim}`,
    `${modelName.replace(/^Toyota\s+/i, "")} ${trim}`,
  ];
  
  // Check for exact match first
  for (const variation of variations) {
    const exactMatch = AVAILABLE_IMAGES.find(img => 
      normalizeString(img) === normalizeString(variation)
    );
    if (exactMatch) {
      return exactMatch;
    }
  }
  
  // If no exact match, find the most similar
  let bestMatch = AVAILABLE_IMAGES[0];
  let bestScore = 0;
  
  for (const variation of variations) {
    for (const image of AVAILABLE_IMAGES) {
      const score = calculateSimilarity(variation, image);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = image;
      }
    }
  }
  
  // Only return if similarity is reasonable (at least 0.3)
  if (bestScore >= 0.3) {
    return bestMatch;
  }
  
  // Fallback: try to match just the model name
  for (const image of AVAILABLE_IMAGES) {
    const modelOnly = normalizeString(modelName.replace(/^Toyota\s+/i, ""));
    const imageModel = normalizeString(image.split(' ')[0] + ' ' + (image.split(' ')[1] || ''));
    if (calculateSimilarity(modelOnly, imageModel) > 0.5) {
      return image;
    }
  }
  
  // Last resort: return first available image
  return AVAILABLE_IMAGES[0];
}

// Helper function to map vehicle name to image path
function getVehicleImagePath(baseModel: string, trimName: string): string {
  const bestMatch = findBestMatch(baseModel, trimName);
  const path = `/questions/Toyoquest/${bestMatch}.png`;
  // Debug logging (remove in production)
  console.log(`Matching "${baseModel} ${trimName}" to "${bestMatch}" -> ${path}`);
  return path;
}

// Map quiz cards to appropriate default vehicles
const CARD_TO_VEHICLES: Record<string, { base_model: string; trim_name: string }[]> = {
  'Sleek Sporty': [
    { base_model: "Camry", trim_name: "XSE" },
    { base_model: "GR Supra", trim_name: "3.0" },
    { base_model: "GR86", trim_name: "Premium" }
  ],
  'Family Roomy': [
    { base_model: "Highlander", trim_name: "Limited" },
    { base_model: "Sienna", trim_name: "XLE" },
    { base_model: "Grand Highlander", trim_name: "Limited" }
  ],
  'Gas1 Mood': [
    { base_model: "Prius", trim_name: "XLE" },
    { base_model: "RAV4 Hybrid", trim_name: "XLE" },
    { base_model: "Highlander Hybrid", trim_name: "XLE" }
  ],
  'Gas2 Whatev': [
    { base_model: "Camry", trim_name: "SE" },
    { base_model: "RAV4", trim_name: "XLE" },
    { base_model: "Corolla", trim_name: "XSE" }
  ],
  'Speed Demon': [
    { base_model: "Prius", trim_name: "XLE" },
    { base_model: "Corolla Hybrid", trim_name: "XLE" },
    { base_model: "RAV4 Hybrid", trim_name: "XSE" }
  ],
  'Practical Life': [
    { base_model: "GR Corolla", trim_name: "Premium Plus" },
    { base_model: "Camry", trim_name: "XSE" },
    { base_model: "GR Supra", trim_name: "3.0 Premium" }
  ],
  'Chill': [
    { base_model: "Corolla", trim_name: "XSE" },
    { base_model: "Camry", trim_name: "LE" },
    { base_model: "Corolla Hatchback", trim_name: "XSE" }
  ],
  'Chaos': [
    { base_model: "4Runner", trim_name: "TRD Pro" },
    { base_model: "Tacoma", trim_name: "TRD Pro" },
    { base_model: "Tundra", trim_name: "TRD Pro" }
  ]
};

// Get fallback vehicles based on selected cards
function getFallbackVehicles(selectedCards: string[]): Recommendation[] {
  if (!selectedCards || selectedCards.length === 0) {
    // Default fallback if no cards selected
    return [
      { rank: 1, base_model: "Camry", trim_name: "SE" },
      { rank: 2, base_model: "Highlander Hybrid", trim_name: "XLE" },
      { rank: 3, base_model: "Corolla Cross", trim_name: "LE" }
    ];
  }

  // Collect vehicles from all selected cards
  const vehiclePool: { base_model: string; trim_name: string }[] = [];
  for (const card of selectedCards) {
    const vehicles = CARD_TO_VEHICLES[card];
    if (vehicles) {
      vehiclePool.push(...vehicles);
    }
  }

  // Remove duplicates and return top 3
  const unique = Array.from(
    new Map(vehiclePool.map(v => [`${v.base_model} ${v.trim_name}`, v])).values()
  );

  return unique.slice(0, 3).map((v, idx) => ({
    rank: idx + 1,
    base_model: v.base_model,
    trim_name: v.trim_name
  }));
}

export default function podium() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    // Fetch quiz selections first
    const fetchQuizData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/quiz');
        const data = await res.json();
        if (data.selectedCards) {
          setSelectedCards(data.selectedCards);
        }
      } catch (err) {
        console.log('Could not fetch quiz data, will use defaults');
      }
    };

    // Fetch recommendations from Flask backend
    const fetchRecommendations = async () => {
      try {
        // First get quiz data
        await fetchQuizData();
        
        const res = await fetch('http://127.0.0.1:5000/recommendations');
        const data = await res.json();
        
        if (data.success && data.recommendations && data.recommendations.length > 0) {
          // Sort by rank to ensure correct order
          const sorted = data.recommendations.sort((a: Recommendation, b: Recommendation) => a.rank - b.rank);
          setRecommendations(sorted);
        } else {
          // No recommendations - fallbacks will be used in render
          console.log('No recommendations from API, will use card-based fallback vehicles');
          setRecommendations([]);
        }
      } catch (err) {
        // Silently use fallback vehicles instead of showing error
        console.error('Failed to fetch recommendations:', err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Get the top 3 recommendations or use card-based fallbacks
  const firstPlace = recommendations.find(r => r.rank === 1);
  const secondPlace = recommendations.find(r => r.rank === 2);
  const thirdPlace = recommendations.find(r => r.rank === 3);

  // Use card-based fallbacks if no recommendations
  const fallbacks = recommendations.length === 0 ? getFallbackVehicles(selectedCards) : [];
  const displayFirst = firstPlace || fallbacks[0] || { base_model: "Camry", trim_name: "SE", rank: 1 };
  const displaySecond = secondPlace || fallbacks[1] || { base_model: "Highlander Hybrid", trim_name: "XLE", rank: 2 };
  const displayThird = thirdPlace || fallbacks[2] || { base_model: "Corolla Cross", trim_name: "LE", rank: 3 };

  return (
     <>
      <Navbar />
      <div className="w-[1512px] h-[700px] relative bg-white overflow-hidden">
        <Confetti />

        {/* Vehicle images positioned in their podium spots */}
        {/* 1st Place - Center/Top - Zoomed out */}
        <div className="absolute left-[643px] top-[340px] w-52 h-64 z-0 overflow-hidden">
          <img 
            src={getVehicleImagePath(displayFirst.base_model, displayFirst.trim_name)} 
            alt={`${displayFirst.base_model} ${displayFirst.trim_name}`} 
            className="w-full h-full object-contain rounded-[10px]"
            style={{ transform: 'scale(0.75)' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(`Failed to load image: ${target.src}`);
              // Try fallback
              const fallback = "/questions/Toyoquest/Camry SE.png";
              if (target.src !== fallback) {
                target.src = fallback;
              } else {
                // If fallback also fails, hide the image
                target.style.display = 'none';
              }
            }}
          />
        </div>

        {/* 2nd Place - Left - Zoomed out */}
        <div className="absolute left-[359px] top-[420px] w-52 h-44 z-0 overflow-hidden">
          <img 
            src={getVehicleImagePath(displaySecond.base_model, displaySecond.trim_name)} 
            alt={`${displaySecond.base_model} ${displaySecond.trim_name}`} 
            className="w-full h-full object-contain rounded-[10px]"
            style={{ transform: 'scale(0.75)' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(`Failed to load image: ${target.src}`);
              // Try fallback
              const fallback = "/questions/Toyoquest/Highlander Hybrid XLE.png";
              if (target.src !== fallback) {
                target.src = fallback;
              } else {
                target.style.display = 'none';
              }
            }}
          />
        </div>

        {/* 3rd Place - Right - Zoomed out */}
        <div className="absolute left-[926px] top-[490px] w-52 h-28 z-0 overflow-hidden">
          <img 
            src={getVehicleImagePath(displayThird.base_model, displayThird.trim_name)} 
            alt={`${displayThird.base_model} ${displayThird.trim_name}`} 
            className="w-full h-full object-contain rounded-[10px]"
            style={{ transform: 'scale(0.75)' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(`Failed to load image: ${target.src}`);
              // Try fallback
              const fallback = "/questions/Toyoquest/Corolla Cross LE.png";
              if (target.src !== fallback) {
                target.src = fallback;
              } else {
                target.style.display = 'none';
              }
            }}
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/80">
            <div className="text-2xl font-bold text-black">Loading your recommendations...</div>
          </div>
        )}

        <div className="left-[473px] top-[40px] absolute justify-start text-black text-4xl font-bold font-['Inter'] z-10">Your Champions of the Road!</div>
        <div className="left-[430px] top-[90px] absolute justify-start text-black text-2xl font-normal font-['Inter'] z-10">Your best Toyota fits, ranked and ready for the road.</div>
        <div className="w-[652px] h-5 left-[400px] top-[620px] absolute bg-red-600 rounded-2xl border border-black z-10" />
        <div className="w-52 h-44 left-[359px] top-[420px] absolute bg-zinc-300/0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-zinc-300 z-10" />
        <div className="w-52 h-64 left-[643px] top-[340px] absolute bg-zinc-300/0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-zinc-300 z-10" />
        <div className="w-52 h-28 left-[926px] top-[490px] absolute bg-zinc-300/0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-zinc-300 z-10" />
        <div className="left-[380px] top-[430px] absolute justify-start text-black text-wrap text-lg font-bold font-['Inter'] z-10 max-w-[200px]">
          2nd - {displaySecond.base_model} {displaySecond.trim_name}
        </div>
        <div className="left-[670px] top-[350px] absolute justify-start text-black text-xl font-bold font-['Inter'] z-10 max-w-[200px]">
          1st - {displayFirst.base_model} {displayFirst.trim_name}
        </div>
        <div className="left-[948px] top-[495px] absolute justify-start text-black text-wrap text-lg font-bold font-['Inter'] z-10 max-w-[200px]">
          3rd - {displayThird.base_model} {displayThird.trim_name}
        </div>
        <div className="w-48 h-5 left-[657px] top-[200px] absolute justify-start text-black text-2xl text-nowrap font-normal font-['Inter'] z-10">Your top Toyota Pick!</div>
        <div className="w-64 h-10 left-[610px] top-[320px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(0,_0,_0,_0.10)_0%,_rgba(255,_255,_255,_0.10)_100%)] rounded-full z-10" />
        <div className="w-64 h-9 left-[905px] top-[465px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(0,_0,_0,_0.10)_0%,_rgba(255,_255,_255,_0.10)_100%)] rounded-full z-10" />
        <div className="w-64 h-10 left-[340px] top-[395px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(0,_0,_0,_0.10)_0%,_rgba(255,_255,_255,_0.10)_100%)] rounded-full z-10" />
        <div className="w-[637px] h-3.5 left-[330px] top-[660px] absolute inline-flex whitespace-nowrap gap-1 z-10">
          <span className="text-black text-base font-normal font-['Inter']">Not satisfied with your journey's outcome?</span>
          <span className="text-red-600 text-base font-normal font-['Inter'] underline">Adjust your finances</span>
          <span className="text-black text-base font-normal font-['Inter']">or</span>
          <span className="text-red-600 text-base font-normal font-['Inter'] underline">retake the quest</span>
          <span className="text-black text-base font-normal font-['Inter']">to explore new matches!</span>
        </div>

      </div>
     </>
  );
} 
