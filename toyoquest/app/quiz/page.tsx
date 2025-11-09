"use client";
import React, { useState } from "react";
import Navbar from "../navbar"; 
import { FaCircle } from "react-icons/fa6";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";


export default function quiz() {  
  return (
     <>
      <Navbar />
      <div className="flex flex-col mt-6 items-center relative min-h-screen bg-white">
        <h1 className="font-bold text-5xl mt-8 mb-8 text-black">What Kind of Car do you prefer?</h1>
        <p className="text-xl text-center max-w-2xl text-black">
          press a card to select your choice.
        </p>

        <div className= "flex flex-row gap-8">
        <FaCircle size={60} className="text-[#E10A1D]" />
          <span className="absolute text-white text-2xl font-bold top-4">
            < FaChevronLeft  />
          </span>
  
        <FaCircle size={60} className="text-[#E10A1D]" />
          <span className="absolute text-white text-2xl font-bold top-4">
            < FaChevronRight  />
          </span>
        </div>
        </div>
     </>
  );
} 
