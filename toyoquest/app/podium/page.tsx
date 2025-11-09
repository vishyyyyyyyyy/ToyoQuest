"use client";
import React, { useState } from "react";
import Navbar from "../navbar"; 
import Image from "next/image";
import Confetti from "../../confetti";


export default function podium() {  
  return (
     <>
      <Navbar />
      <div className="w-[1512px] h-[700px] relative bg-white overflow-hidden">
        <Confetti />
  <div className="left-[473px] top-[40px] absolute justify-start text-black text-4xl font-bold font-['Inter']">Your Champions of the Road!</div>
  <div className="left-[430px] top-[90px] absolute justify-start text-black text-2xl font-normal font-['Inter']">Your best Toyota fits, ranked and ready for the road.</div>
  <div className="w-[652px] h-5 left-[444px] top-[620px] absolute bg-red-600 rounded-2xl border border-black" />
  <div className="w-52 h-44 left-[359px] top-[420px] absolute bg-zinc-300/0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-zinc-300" />
  <div className="w-52 h-64 left-[643px] top-[340px] absolute bg-zinc-300/0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-zinc-300" />
  <div className="w-52 h-28 left-[926px] top-[490px] absolute bg-zinc-300/0 rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] border border-zinc-300" />
  <div className="left-[380px] top-[430px] absolute justify-start text-black text-4xl font-bold font-['Inter']">2nd- blah</div>
  <div className="left-[670px] top-[350px] absolute justify-start text-black text-4xl font-bold font-['Inter']">1st - blah</div>
  <div className="left-[948px] top-[495px] absolute justify-start text-black text-4xl font-bold font-['Inter']">3rd - blah</div>
  <div className="w-48 h-5 left-[657px] top-[474px] absolute justify-start text-black text-2xl font-normal font-['Inter']">Your top Toyota Pick!</div>
  <div className="w-64 h-10 left-[620px] top-[320px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(0,_0,_0,_0.10)_0%,_rgba(255,_255,_255,_0.10)_100%)] rounded-full" />
  <div className="w-64 h-9 left-[905px] top-[465px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(0,_0,_0,_0.10)_0%,_rgba(255,_255,_255,_0.10)_100%)] rounded-full" />
  <div className="w-64 h-10 left-[340px] top-[395px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(0,_0,_0,_0.10)_0%,_rgba(255,_255,_255,_0.10)_100%)] rounded-full" />
  <div className="w-[637px] h-3.5 left-[330px] top-[660px] absolute inline-flex whitespace-nowrap gap-1">
  <span className="text-black text-base font-normal font-['Inter']">Not satisfied with your journey’s outcome?</span>
  <span className="text-red-600 text-base font-normal font-['Inter'] underline">Adjust your finances</span>
  <span className="text-black text-base font-normal font-['Inter']">or</span>
  <span className="text-red-600 text-base font-normal font-['Inter'] underline">retake the quest</span>
  <span className="text-black text-base font-normal font-['Inter']">to explore new matches!</span>
</div>
</div>
     </>
  );
} 
