import { useState } from "react"

const userTypes = [
  "Customer",
  "Doctor",
  "Nurse",
  "Staff"
]

function App() {

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = () => {
    setCurrentIndex((currentIndex + 1) % userTypes.length)
  }

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">

      <div id="loginForm" className="w-[300px] h-[200px] bg-gray-300/30 flex flex-col justify-center items-center gap-[20px] rounded-lg backdrop-blur-2xl shadow-lg">

        <input placeholder="Email" className="border-solid border-1 rounded-lg w-[80%] h-[30px] p-2 border-gray-400" />
        <input placeholder="Password" className="border-solid border-1 rounded-lg w-[80%] h-[30px] p-2 border-gray-400" />

        <button className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mt-[10px]">
          Submit
        </button>
      </div>

      <div className="absolute bottom-[40px] text-[28px] flex flex-row h-[42px] gap-[10px] overflow-hidden">
        <span>I am a </span>
        <span
          className="font-bold transition-all duration-200 linear"
          style={{ transform: `translateY(-${currentIndex * 42}px)` }}
          onClick={handleClick}>
          {userTypes.map((type, index) => (
            <p key={index}>{type}</p>
          ))}
        </span>
      </div>

    </div>
  )
}

export default App