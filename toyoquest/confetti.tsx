"use client";
import React from "react";

export default function Confetti() {
  const colors = ["#D9D9D9", "#E10A1D", "#FF8C97", "#000000"];

  // Generate 30 confetti pieces
  const confettiPieces = Array.from({ length: 30 }).map(() => ({
    width: Math.random() * 8 + 4,    // 4px - 12px
    height: Math.random() * 12 + 6,  // 6px - 18px for capsule shape
    left: Math.random() * 100,       // horizontal position
    color: colors[Math.floor(Math.random() * colors.length)],
    rotate: Math.random() * 360,     // initial rotation
    delay: Math.random() * 2,        // stagger start 0-2s
  }));

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {confettiPieces.map((c, i) => (
        <div
          key={i}
          style={{
            width: `${c.width}px`,
            height: `${c.height}px`,
            backgroundColor: c.color,
            position: "absolute",
            left: `${c.left}%`,
            top: "-20px",
            borderRadius: "999px", // capsule shape
            transform: `rotate(${c.rotate}deg)`,
            animation: `fall 3s ease-in forwards`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
