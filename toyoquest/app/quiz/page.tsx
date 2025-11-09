"use client";
import React, { useState } from "react";
import Navbar from "../navbar"; 
import Image from "next/image";
import { useRouter } from 'next/navigation';

const cards = [
  { name: 'Sleek Sporty', src: '/card assets/vibe-sleeksporty.svg' },
  { name: 'Family Roomy', src: '/card assets/vibe-familyroomy.svg' },
  { name: 'Gas1 Mood', src: '/card assets/gas1mood.svg' },
  { name: 'Gas2 Whatev', src: '/card assets/gas2whatev.svg' },
  { name: 'Speed Demon', src: '/card assets/speed demon.svg' },
  { name: 'Practical Life', src: '/card assets/practical life.svg' },
  { name: 'Chill', src: '/card assets/chill.svg' },
  { name: 'Chaos', src: '/card assets/offroad.svg' },
];

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const router = useRouter();

  const handleSubmit = async (cardName: string) => {
    // Save the selected card
    const updatedCards = [...selectedCards, cardName];
    setSelectedCards(updatedCards);

    // Move to the next pair
    if (currentIndex >= cards.length - 2) {
      // End of quiz - send selections to backend then navigate
      console.log("All selected cards:", updatedCards);
      
      try {
        const res = await fetch('http://127.0.0.1:5000/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedCards: updatedCards }),
        });

        if (!res.ok) {
          console.error('Failed to save quiz selections:', res.status);
        }

        const json = await res.json();
        console.log('Saved quiz selections:', json);
      } catch (err) {
        console.error('Error saving quiz selections:', err);
      }

      // Navigate to podium regardless of save success
      router.push('/podium');
    } else {
      setCurrentIndex(currentIndex + 2);
    }
  };

  // Progress
  const totalSteps = Math.ceil(cards.length / 2);
  const currentStep = Math.floor(currentIndex / 2) + 1;
  const progressPercent = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 100;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center relative min-h-screen bg-white">
        <h1 className="font-bold text-4xl mt-5 mb-8 text-black">What's your vibe?</h1>
        <p className="text-xl text-center text-black -top-6 relative">
          press a card to select your choice
        </p>

        {/* Display two cards at a time */}
        <div className="flex flex-row gap-16 top-4 relative">
          {/* First card */}
          <div className="relative">
            <Image
              src={cards[currentIndex].src}
              alt={cards[currentIndex].name}
              width={350}
              height={200}
            />
            <button
              onClick={() => handleSubmit(cards[currentIndex].name)}
              className="bg-[#E10A1D] text-white font-bold text-2xl rounded-3xl w-40 h-13 absolute bottom-2 left-50 transform -rotate-5 -translate-x-1/2"
            >
              Submit
            </button>
          </div>

          {/* Second card */}
          <div className="relative">
            <Image
              src={cards[(currentIndex + 1) % cards.length].src}
              alt={cards[(currentIndex + 1) % cards.length].name}
              width={350}
              height={200}
            />
            <button
              onClick={() => handleSubmit(cards[(currentIndex + 1) % cards.length].name)}
              className="bg-[#E10A1D] text-white font-bold text-2xl rounded-3xl w-40 h-13 absolute bottom-2 left-40 transform rotate-5 -translate-x-1/2"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex justify-center w-full mt-10">
          <div className="w-[837px] max-w-full px-2">
            <div className="w-full h-5 bg-zinc-300/40 rounded-2xl border border-black" aria-hidden="true">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPercent)}
                className="h-5 bg-[#E10A1D] rounded-2xl transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
