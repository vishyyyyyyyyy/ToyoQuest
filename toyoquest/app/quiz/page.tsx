"use client";
import React, { useState } from "react";
import Navbar from "../navbar"; 
import { FaCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Image from "next/image";
import { useRouter } from 'next/navigation';

// Import your images
// Images are stored in `public/card assets/` — reference them by public path (no import)
const sleekSporty = '/card assets/vibe-sleeksporty.svg';
const familyRoomy = '/card assets/vibe-familyroomy.svg';
const gas1 = '/card assets/gas1mood.svg';
const gas2 = '/card assets/gas2whatev.svg';
const speeddemon = '/card assets/speed demon.svg';
const practicallife = '/card assets/practical life.svg';
const chill = '/card assets/chill.svg';
const chaos = '/card assets/offroad.svg';

export default function Quiz() {
  // Array of card images
  const cards = [sleekSporty, familyRoomy, gas1, gas2, speeddemon, practicallife, chill, chaos];
  const [currentIndex, setCurrentIndex] = useState(0);

  // compute whether navigation is allowed
  const canPrev = currentIndex > 0;
  // allow Next when there are more pairs OR when we're at the last pair (so it can go to podium)
  const canNext = currentIndex <= cards.length - 2;
  const router = useRouter();

  // progress: one step = two cards. Show progress from 0% (start) to 100% (last step)
  const totalSteps = Math.ceil(cards.length / 2);
  const currentStep = Math.floor(currentIndex / 2) + 1; // 1-based
  const progressPercent = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 100;

  const handleNext = () => {
    // if we're at (or past) the last pair, go to podium
    if (currentIndex >= cards.length - 2) {
      router.push('/podium');
      return;
    }

    // move forward by 2 cards, but don't go past the last pair
    setCurrentIndex((prev) => Math.min(prev + 2, cards.length - 2));
  };

  const handlePrev = () => {
    // move backward by 2 cards, but don't go before the first
    setCurrentIndex((prev) => Math.max(prev - 2, 0));
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center relative min-h-screen bg-white">
        <h1 className="font-bold text-4xl mt-5 mb-8 text-black">What's your vibe?</h1>
        <p className="text-xl text-center text-black -top-6 relative">
          press a card to select your choice
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-row gap-300 top-50 relative">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canPrev}
            aria-label="Previous cards"
            className={`relative ${canPrev ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          >
            <FaCircle size={60} className="text-[#E10A1D]" />
            <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
              <FaChevronLeft />
            </span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext}
            aria-label="Next cards"
            className={`relative ${canNext ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          >
            <FaCircle size={60} className="text-[#E10A1D]" />
            <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
              <FaChevronRight />
            </span>
          </button>
        </div>

        {/* Display two cards at a time */}
        <div className="flex flex-row gap-16 -top-10 relative">
          <Image
            src={cards[currentIndex]}
            alt={`Vibe Card ${currentIndex + 1}`}
            width={350}
            height={200}
          />
          <Image
            src={cards[(currentIndex + 1) % cards.length]} // second card
            alt={`Vibe Card ${(currentIndex + 2)}`}
            width={350}
            height={200}
          />
        </div>

        {/* Progress bar */}
        <div className="mt-6 flex justify-center w-full">
          <div className="w-[837px] max-w-full px-2">
            <div
              className="w-full h-3 bg-zinc-300/40 rounded-2xl border border-black"
              aria-hidden="true"
            >
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPercent)}
                className="h-3 bg-[#E10A1D] rounded-2xl transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
