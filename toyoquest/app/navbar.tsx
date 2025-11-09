"use client";
import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <div className="flex flex-row justify-between items-center border-b-6 p-4 font-bold text-black bg-white">
       TOYOQUEST
       <img src="https://www.vectorlogo.zone/logos/toyota/toyota-tile.svg" alt="Toyota Logo" className="w-10 h-10 ml-2" >
        </img>
      </div>
    </nav>
  );
}
