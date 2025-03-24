import React, { useEffect, useState } from 'react'
import FaceDetection from '../components/faceDetection'
import { motion } from 'framer-motion'
import useSound from 'use-sound'
import startSound from "/sounds/8bit-game-start.wav"
import levelCompleteSound from "/sounds/8bit-level-complete.mp3"
import gameCompleteSound from "/sounds/8bit-game-complete.wav"

function Game() {
    const expressions = ['left eye closed', 'right eye closed', 'head turned left', 'head turned right', 'smile', 'sad face', 'surprised face', 'angry face']

    const [score, setScore] = useState(0)
    const [level, setLevel] = useState(1)
    const [accuracy, setAccuracy] = useState(0)
    const [gameStart, setGameStart] = useState(false)
    const [targetExpression, setTargetExpression] = useState(expressions[0])
    const [detectedExpression, setDetectedExpression] = useState('')
    const [gameResult, setGameResult] = useState(false)

    const [ playGameStart ] = useSound(startSound)
    const [ playLevelComplete ] = useSound(levelCompleteSound)
    const [ playGameComplete ] = useSound(gameCompleteSound)

    // progress bar for levels
    const progress = ((level / expressions.length) * 100) -10

    useEffect(() => {
        if (detectedExpression === targetExpression) {
            playLevelComplete()
            handleLevelCompletion()
        }
    }, [detectedExpression])   

    // toggle game start / end
    function toggleGame() {
        setGameStart(!gameStart)
        gameStart ? playGameComplete() : playGameStart()
    }

    function handleLevelCompletion() {
        setScore(prevScore => prevScore + 10)
        if(level < expressions.length) {
            setLevel(prevLevel => prevLevel + 1)
            setTargetExpression(expressions[level])
        } else {
            setGameResult(true)
            playGameComplete()
        }
    }
    
    // resets the game 
    function resetGame() {
        setScore(0)
        setLevel(1)
        setGameStart(false)
        setGameResult(false)
        setDetectedExpression('')
        setTargetExpression(expressions[0])
    }

    return (
        <div className='bg-gray-900 min-h-screeen h-screen w-screen flex flex-col items-center'>
            {/* title */}
            <motion.h1
                className='press-start-2p-regular text-white text-4xl font-bold p-10'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                Face<span className='text-yellow-400'>Quest</span>
            </motion.h1>

            <div className='flex flex-col flex-grow justify-center items-center w-[75%]'>
                {/* game interface */}
                {gameStart && !gameResult ? (
                    <div className='text-white flex flex-col justify-center items-center w-full'>
                        <div className='press-start-2p-regular text-xl mb-0'>Level {level}</div>
                        <div className='w-3/4 bg-gray-700 rounded-full h-2 mb-16 relative'>
                            <div className='bg-green-500 h-2 w-[100%] rounded-full transition-all duration-500' style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className='flex justify-center h-[80%] w-[100%]'>
                            <div className='flex flex-col items-center press-start-2p-regular w-[50%] mr-2 text-xl'>
                                <div className='mb-6'>Target Expression</div>
                                <img src={`/images/${targetExpression}.jpg`} alt={targetExpression} className='w-[650px] h-[300px] object-cover border-4 border-yellow-400 mb-4 rounded-lg' />
                                {targetExpression}
                            </div>
                            <FaceDetection 
                                level={level}
                                detectedExpression={detectedExpression}
                                setDetectedExpression={setDetectedExpression}
                                setAccuracy={setAccuracy}
                            />
                        </div>
                        {/* <div>Score: {score}</div>
                        <div>Accuracy: {accuracy}%</div>
                        <div>Minimum score to pass: 50</div> */}
                    </div>
                ) : (
                    // game start screen
                    <div className='press-start-2p-regular flex flex-col justify-center items-center'>
                        <div className='text-white text-xl mb-5 text-center'>Get ready to play FaceQuest!</div>
                        <button 
                            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 mt-6 rounded-lg shadow-lg' 
                            onClick={toggleGame}
                        >
                            Start Game
                        </button>
                    </div>
                )}
            </div>

            {/* game end and reset */}
            { gameResult ? (
                <div className='fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50'>
                    <div className='bg-green-200 border border-yellow-400 p-8 py-24 rounded-lg shadow-lg text-center w-fit'>
                        <h1 className='press-start-2p-regular text-4xl'>Yay! You completed the Face<span className='text-yellow-400'>Quest</span></h1>
                        <button onClick={resetGame} className='press-start-2p-regular bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 mt-16 rounded-lg'>Reset Game</button>
                    </div>
                </div>
            ) : (
                <div></div>
            )}
            <footer className='text-gray-600 mt-6'>©2025 FaceQuest. All rights reserved. <span className='text-gray-900 block text-center'>Github: <a href="https://github.com/OgAeons">OgAeons</a></span></footer>
        </div>
    )
}

export default Game