import React, { useState } from 'react'
import FaceDetection from './components/faceDetection'

const App = () => {
    const [gameStart, setGameStart] = useState(false)

    function toggleGame() {
        setGameStart(!gameStart)
    }
    
    return (
        <div className='bg-gray-900 min-h-screen h-screen flex flex-col items-center'>
            <h1 className='text-white text-4xl font-bold p-8'>FaceQuest</h1>
            <div className='h-[70vh] w-[80vw] flex flex-col justify-center items-center'>
                {gameStart === true ? (
                    <FaceDetection />
                ) : (
                    <div className='flex flex-col justify-center items-center'>
                        <div className='text-white text-xl'>Get ready to play FaceQuest!</div>
                        <button 
                            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow-lg ' 
                            onClick={toggleGame}
                        >
                            Start Game
                        </button>
                    </div>
                )}
                
            </div>
            <footer className='text-gray-600 mt-6'>©2025 FaceQuest. All rights reserved. <span className='text-gray-900 block text-center'>Github: <a href="https://github.com/OgAeons">OgAeons</a></span></footer>
        </div>
    )
}

export default App