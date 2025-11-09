"use client";
import React from 'react';
import Link from 'next/link';
import { GiHamburgerMenu } from "react-icons/gi";

export default function Navbar() {
  return (
    <nav>
      <div className="flex flex-row justify-between items-center p-4 font-bold text-black bg-white">
       TOYOQUEST
        <button aria-label="Open menu" className="p-2">
          <GiHamburgerMenu size={24} />
        </button>
      </div>
    </nav>
  );
}
