"use client";
import React, { useState } from "react";
import Navbar from "../navbar"; 
import { FaCircle } from "react-icons/fa6";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import Image from "next/image";


export default function quiz() {  
  return (
     <>
      <Navbar />
      <div className="flex flex-col  items-center relative min-h-screen bg-white">
        <h1 className="font-bold text-5xl mt-8 mb-8 text-black">What Kind of Car do you prefer?</h1>
        <p className="text-xl text-center max-w-2xl text-black">
          press a card to select your choice <br />
          use the arrows to navigate between questions
        </p>

        <div className="justify-content-center align-items-center  flex flex-row gap-300 top-45  relative">
            {/* Left circle */}
            <div className="relative">
              <FaCircle size={60} className="text-[#E10A1D]" />
              <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                <FaChevronLeft />
              </span>
            </div>

            {/* Right circle */}
            <div className="relative">
              <FaCircle size={60} className="text-[#E10A1D]" />
              <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                <FaChevronRight />
              </span>
            </div>
          </div>

        <Image src="/rectangle-3.svg" alt="Rectangle" width={200} height={100} />
      </div>

     </>
  );
} 
