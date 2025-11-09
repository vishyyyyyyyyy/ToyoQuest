import Navbar from '../navbar';
import Link from 'next/link';
export default function Start() {
    return (
        <>
        <Navbar />
        <div className="w-[1512px] h-[982px] relative bg-white overflow-hidden">
<div className="w-44 h-[845.08px] left-[1148px] top-[26.99px] absolute origin-top-left rotate-[-28deg] bg-red-200 rounded-3xl" />
<div className="w-44 h-[469.20px] left-[857px] top-[-56.01px] absolute origin-top-left rotate-[-28deg] bg-red-600 rounded-3xl" />
<Link className="w-96 h-24 bg-red-600 rounded-[107px] ml-[536px] mt-[559px] absolute flex items-center justify-center text-white text-3xl font-bold font-['Inter']" href = "./toquiz">Get Started</Link>
<div className="left-[332px] top-[329px] absolute justify-start text-black text-5xl font-bold font-['Inter']">Let’s talk finances!</div>
<div className="w-[826px] left-[332px] top-[408px] absolute justify-start text-black text-3xl font-normal font-['Inter']">Before we dive in, tell us a bit about your budget and financial profile so we can find the perfect fit for you.</div>
<div className="w-44 h-[996.37px] left-[-200px] top-[278.99px] absolute origin-top-left rotate-[-28deg] bg-red-400 rounded-3xl" />
<div className="w-44 h-[595.87px] left-[259.40px] top-[675.49px] absolute origin-top-left rotate-[-28deg] bg-red-300 rounded-3xl" />
</div>
                </>
    )
}