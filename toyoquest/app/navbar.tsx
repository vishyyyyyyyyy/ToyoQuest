"use client";
import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <div className="flex flex-row justify-between items-center border-b-6 p-4 font-bold text-black bg-white">
       TOYOQUEST
        <button aria-label="Open menu" className="p-2">
        </button>
      </div>
    </nav>
  );
}
