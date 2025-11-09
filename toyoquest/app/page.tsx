import Image from "next/image";
import Navbar from './navbar';
import { TbCircleNumber2Filled } from "react-icons/tb";
import { TbCircleNumber1Filled } from "react-icons/tb";
import { FaArrowCircleDown } from "react-icons/fa";


export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col">
        <div className="min-h-screen bg-white">
          <div className="flex flex-col items-center justify-center min-h-[200px] py-2 bg-[#EAEAEA] text-black">
            <h1 className="text-5xl font-bold">Welcome to ToyoQuest</h1>
            <p className="mt-4 text-1xl">An adventure to finding a car that fits <span className="text-[#E10A1D]">YOU</span> starts here.</p>
          </div>

          <div className="flex flex-row items-center mt-8 gap-10 justify-center text-white">
              <div className= "bg-[#E10A1D] w-80 h-80 p-10 mb-6 text-white rounded-md">
              <h2 className="text-4xl font-semibold mb-4">How It Works</h2>
              <p className="mt-2">Find your dream car in just 2 simple steps:</p>
              </div>

              <div className= "flex flex-col">
              <div className= " w-80 h-40 p-10 mb-6 text-black rounded-md">
                <TbCircleNumber1Filled size={40} className="text-red-500" />
                <p className="mt-2">Step 1: Enter Your Financial Information</p>
              </div>

              <div className= " w-80 h-40 p-10 mb-6 text-black rounded-md">
                <TbCircleNumber2Filled size={40} className="text-red-500" />
                <p className="mt-2">Step 2: Take a short quiz to find what car suits you best</p>
              </div>
              </div>

            </div>

            <div className=" underline text-lg font-semibold text-black mt-20 items-align-center justify-center flex">
                Get Started Below
                <FaArrowCircleDown className="text-red-500"/>
              </div>
          </div>
        </div>
    </>

  );
}
