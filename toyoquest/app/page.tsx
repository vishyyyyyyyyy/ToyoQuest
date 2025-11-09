import Image from "next/image";
import Navbar from './navbar';
import { FaCircle } from "react-icons/fa6";
import { FaArrowCircleDown } from "react-icons/fa";
import Link from 'next/link';
import Start from "./start/page";


export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col">
        <div className="min-h-[90vh] bg-white">
          <div className="flex flex-col items-center justify-center min-h-[200px] py-2 bg-[#E10A1D] text-white leading-loose" >
            <h1 className="text-5xl font-bold">Welcome to ToyoQuest!<br /> Embark on an adventure to find the car made for you.</h1>
          </div>


          <div className="flex flex-row items-center mt-8 gap-25 justify-center text-white">
            <div className="relative text-nowrap">
              <h2 className= " absolute left-2 top-7 text-black font-bold text-2xl">How it works How it works How it</h2>
              <h2 className= " absolute left-65 top-50 text-black font-bold text-2xl transform rotate-90"> works How it works How it</h2>
              <h2 className= " absolute left-2 top-95 text-black font-bold text-2xl transform rotate-180">works How it works How it works </h2>
              <h2 className= " absolute -left-42 top-50 text-black font-bold text-2xl transform rotate-270"> works How it works How it</h2>

              <div className= "bg-[#E10A1D] w-100 h-80 p-10 mb-6 mt-15 text-white rounded-md left-3">
              <h2 className="text-5xl font-semibold mb-4">How it <br /> works: </h2>
              <p className="mt-2 font-weight-400  "> <br/ > Find your dream car in just 2 simple steps:</p>
              </div>
              </div>

              <div className = "flex flex-col">
              <div className="flex flex-col align-items-center">
                <div className=" flex flex-row relative  p-10 mb-6 text-black rounded-md gap-4">
                  <div className="relative w-full flex justify-center"> 
                    <FaCircle size={60} className="text-[#E10A1D]" />
                    <span className="absolute text-white text-2xl font-bold top-4">
                      1
                    </span>
                  </div>
                  
                 <div className="flex flex-col text-left">
                    <h1 className="mt-4 text-3xl font-bold">Step One:</h1>
                    <p className="mt-4 text-3xl font-regular whitespace-nowrap">
                      Enter Your Financial Information
                    </p>
                </div>
                </div>
              </div>   


               <div className="flex flex-row gap-4">
                <div className=" flex flex-row relative w-80 h-40 p-10 mb-6 text-black rounded-md gap-4">
                  <div className="relative w-full flex justify-center">
                    <FaCircle size={60} className="text-[#E10A1D]" />
                    <span className="absolute text-white text-2xl font-bold top-4">
                      2
                    </span>
                  </div>
                  
                  <div className="flex flex-col text-left">
                    <h1 className="mt-4 text-3xl font-bold">Step Two:</h1>
                    <p className="mt-4 text-3xl font-regular whitespace-nowrap">
                      Venture on a short quest to uncover <br /> the Toyota that matches your vibe
                    </p>
                </div>
                </div>
              </div>
              </div>

            </div>

            <div className=" underline text-md font-semibold text-black mt-4 items-align-center gap-4 justify-center flex">
                <Link href = "/start">Get Started Below</Link>
                <FaArrowCircleDown className="text-[#E10A1D] mt-1"/>
                {/* add click animaiton scroll here */}
              </div>
          </div>

          <Start/ >
    </div>


    </>

  );
}