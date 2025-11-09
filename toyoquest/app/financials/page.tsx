"use client";
import React, { useState } from "react";
import Navbar from "../navbar";
import { FaUser } from "react-icons/fa";
import Link from "next/link";

export default function Financials() {
  const [isBuying, setIsBuying] = useState(true);
  
  // Form state variables
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [paymentPeriod, setPaymentPeriod] = useState("");
  const [annualMileage, setAnnualMileage] = useState("");
  const [leaseMonths, setLeaseMonths] = useState("");

  return (
    <>
      <Navbar />

      <div className="min-h-[90vh] bg-white flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center p-8 text-black text-center max-w-2xl">
          <h1 className="font-bold text-5xl">Let’s talk finances!</h1>
          <p className="text-xl mt-5 whitespace-nowrap text-center">
            Enter your finances below. It doesn’t have to be perfect — just enough to help us guide you on your car quest.
          </p>
        </div>

        {/* Finance Section */}
        <div className="bg-[#FFDADA] flex flex-row justify-center items-start p-10 text-black w-260 h-130 rounded-xl gap-50 relative">
          {/* Left column */}
          <div className="flex flex-col gap-15">
            <div className="flex items-center gap-4">
              {/* <FaUser className="text-black size-15" /> */}
              <div>
                <h1 className="font-bold text-2xl">What's your name?</h1>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="bg-white p-2 rounded-md w-64 mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h1 className="font-bold text-2xl">What's your budget?</h1>
              <select 
                className="bg-white p-2 rounded-md w-64 mt-2" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="" disabled>Select an option</option>
                <option value="22k_30k">$22,000 - $30,000</option>
                <option value="30k_35k">$30,000 - $35,000</option>
                <option value="35k_40k">$35,000 - $40,000</option>
                <option value="40k_45k">$40,000 - $45,000</option>
                <option value="45k_50k">$45,000 - $50,000</option>
                <option value="50k_plus">Over $50,000</option>
              </select>
            </div>

            <div>
              <h1 className="font-bold text-2xl">What's your credit score?</h1>
              <select 
                className="bg-white p-2 rounded-md w-64 mt-3" 
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
              >
                <option value="" disabled>Select an option</option>
                <option value="760_850">Exceptional (760 - 850)</option>
                <option value="720_759">Excellent (720 - 759)</option>
                <option value="690_719">Great (690 - 719)</option>
                <option value="650_689">Good (650 - 689)</option>
                <option value="630_649">Average (630 - 649)</option>
                <option value="580_609">Poor (580 - 609)</option>
              </select>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-15">
            {/* Toggle */}
            <div className="flex flex-col items-center mb-4 relative -left-23">
              <h1 className="font-bold text-2xl mb-2">Are you...</h1>
              <div
                className="relative w-52 h-10 bg-white rounded-full cursor-pointer"
                onClick={() => setIsBuying(!isBuying)}
              >
                <div
                  className={`absolute top-0 h-full w-1/2 rounded-full transition-all duration-300 ${
                    isBuying ? "left-0 bg-[#E10A1D]" : "left-1/2 bg-[#E10A1D]"
                  }`}
                ></div>
                <div className="absolute inset-0 flex justify-between items-center px-6 font-semibold text-black text-sm">
                  <span className={isBuying ? "text-white" : "text-black"}>Buying</span>
                  <span className={!isBuying ? "text-white" : "text-black"}>Leasing</span>
                </div>
              </div>
            </div>

            {/* Conditional Questions */}
            {isBuying ? (
              <>
                <div className="relative -top-4.5">
                  <h1 className="font-bold text-2xl">How much is your down payment?</h1>
                  <select 
                    className="bg-white p-2 rounded-md w-64 mt-2"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="0">$0</option>
                    <option value="5000">$5,000</option>
                    <option value="10000">$10,000</option>
                    <option value="15000">$15,000</option>
                  </select>
                </div>

                <div className= "= relative -top-4">
                  <h1 className="font-bold text-2xl">How long will you be paying it off?</h1>
                  <select 
                    className="bg-white p-2 rounded-md w-64 mt-2"
                    value={paymentPeriod}
                    onChange={(e) => setPaymentPeriod(e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="48">48 months</option>
                    <option value="60">60 months</option>
                    <option value="72">72 months</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="-top-4.5 relative">
                  <h1 className="font-bold text-2xl">What's your average annual mileage?</h1>
                  <select 
                    className="bg-white p-2 rounded-md w-64 mt-2"
                    value={annualMileage}
                    onChange={(e) => setAnnualMileage(e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="10">10,000 miles</option>
                    <option value="12">12,000 miles</option>
                    <option value="15">15,000 miles</option>
                  </select>
                </div>

                <div className= "= relative -top-12">
                  <h1 className="font-bold text-2xl">How many months are you leasing?</h1>
                  <select 
                    className="bg-white p-2 rounded-md w-64 mt-2"
                    value={leaseMonths}
                    onChange={(e) => setLeaseMonths(e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="36">36 months</option>
                    <option value="39">39 months</option>
                    <option value="42">42 months</option>

                  </select>
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <Link
                  href="/quiz"
                  className="bg-[#E10A1D] text-white font-bold text-2xl rounded-3xl w-40 h-13 absolute left-[55vh ] top-113 flex items-center justify-center"
                >
                  Submit
          </Link>
        </div>
      </div>
    </>
  );
}
