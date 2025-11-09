import Navbar from '../navbar';
import Link from 'next/link';
export default function Toquiz() {
    return (
        <>
        <Navbar />
        <div className="w-[1512px] h-[982px] relative bg-white overflow-hidden">
    <div className="w-44 h-[598.98px] left-[1319.06px] top-[669.78px] absolute origin-top-left rotate-[-152deg] bg-red-600 rounded-3xl" />
    <div className="w-44 h-[695.16px] left-[1380.70px] top-[1097.39px] absolute origin-top-left rotate-[-152deg] bg-red-400 rounded-3xl" />
    <div className="w-44 h-[884.95px] left-[-47.73px] top-[807.99px] absolute origin-top-left rotate-[-152deg] bg-red-200 rounded-3xl" />
    <div className="w-44 h-[638.43px] left-[48.24px] top-[1132.37px] absolute origin-top-left rotate-[-152deg] bg-red-300 rounded-3xl" />
    <Link className="w-96 h-24 bg-red-600 rounded-[107px] ml-[536px] mt-[559px] absolute flex items-center justify-center text-white text-3xl font-bold font-['Inter']" href = "./">Get Started</Link> 
    <div className="w-20 h-20 left-[1399px] top-[27px] absolute" />
    <div className="w-[706px] h-24 left-[403px] top-[349px] absolute justify-start"><span className="text-black text-5xl font-bold font-['Inter']">Ready to begin your quest? <br/></span><span className="text-black text-4xl font-normal font-['Inter']">Take the quiz and discover your ideal car!</span></div>
    
</div>
                </>
    )
}