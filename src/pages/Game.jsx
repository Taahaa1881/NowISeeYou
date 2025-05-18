import React, { useEffect, useState } from 'react'
import FaceDetection from '../components/FaceDetection'
import { motion, AnimatePresence } from 'framer-motion'
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
    const [showScore, setShowScore] = useState(false)

    const [playGameStart] = useSound(startSound)
    const [playLevelComplete] = useSound(levelCompleteSound)
    const [playGameComplete] = useSound(gameCompleteSound)

    const progress = ((level / expressions.length) * 100) - 10

    useEffect(() => {
        if (detectedExpression === targetExpression) {
            playLevelComplete()
            handleLevelCompletion()
        }
    }, [detectedExpression])

    function toggleGame() {
        setGameStart(!gameStart)
        gameStart ? playGameComplete() : playGameStart()
    }

    function handleLevelCompletion() {
        setScore(prevScore => prevScore + 10)
        if (level < expressions.length) {
            setLevel(prevLevel => prevLevel + 1)
            setTargetExpression(expressions[level])
        } else {
            setGameResult(true)
            playGameComplete()
        }
    }

    function resetGame() {
        setScore(0)
        setLevel(1)
        setGameStart(false)
        setGameResult(false)
        setDetectedExpression('')
        setTargetExpression(expressions[0])
    }

    return (
        <div className='bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen h-screen w-screen flex flex-col items-center overflow-hidden'>
            {/* Animated Title */}
            <motion.div
                className='relative w-full'
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className='press-start-2p-regular text-white text-5xl font-bold p-10 text-center'>
                    Face<span className='text-yellow-400 relative'>
                        Quest
                        <motion.span
                            className='absolute -bottom-2 left-0 w-full h-1 bg-yellow-400'
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        />
                    </span>
                </h1>
            </motion.div>

            <div className='flex flex-col flex-grow justify-center items-center w-[85%] max-w-7xl'>
                <AnimatePresence mode='wait'>
                    {gameStart && !gameResult ? (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className='text-white flex flex-col justify-center items-center w-full'
                        >
                            {/* Level and Progress */}
                            <div className='w-full max-w-4xl mb-8'>
                                <div className='flex justify-between items-center mb-2'>
                                    <motion.div
                                        className='press-start-2p-regular text-2xl'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={level}
                                    >
                                        Level {level}
                                    </motion.div>
                                    <motion.div
                                        className='press-start-2p-regular text-xl text-yellow-400'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        Score: {score}
                                    </motion.div>
                                </div>
                                <div className='w-full bg-gray-700 rounded-full h-3 mb-8 relative overflow-hidden'>
                                    <motion.div
                                        className='bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full'
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Game Interface */}
                            <div className='flex justify-center h-[80%] w-full gap-8'>
                                <motion.div
                                    className='flex flex-col items-center press-start-2p-regular w-[50%] text-xl'
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className='mb-6 text-2xl text-yellow-400'>Target Expression</div>
                                    <div className='relative group'>
                                        <img
                                            src={`/images/${targetExpression}.jpg`}
                                            alt={targetExpression}
                                            className='w-[650px] h-[300px] object-cover border-4 border-yellow-400 mb-4 rounded-lg transition-transform duration-300 group-hover:scale-105'
                                        />
                                        <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg' />
                                    </div>
                                    <div className='text-xl mt-4'>{targetExpression}</div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <FaceDetection
                                        level={level}
                                        detectedExpression={detectedExpression}
                                        setDetectedExpression={setDetectedExpression}
                                        setAccuracy={setAccuracy}
                                    />
                                </motion.div>
                            </div>

                            {/* Accuracy Display */}
                            <motion.div
                                className='mt-8 text-center'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className='press-start-2p-regular text-xl text-yellow-400'>
                                    Accuracy: {accuracy}%
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className='press-start-2p-regular flex flex-col justify-center items-center'
                        >
                            <motion.div
                                className='text-white text-3xl mb-8 text-center max-w-2xl'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Welcome to FaceQuest! Master facial expressions and complete all levels to win!
                            </motion.div>
                            <motion.button
                                className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 mt-6 rounded-lg shadow-lg text-xl transform transition-all duration-300 hover:scale-105'
                                onClick={toggleGame}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Adventure
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Game End Modal */}
            <AnimatePresence>
                {gameResult && (
                    <motion.div
                        className='fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className='bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 p-12 rounded-2xl shadow-2xl text-center max-w-2xl'
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.h1
                                className='press-start-2p-regular text-4xl mb-8'
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Congratulations! 🎉
                            </motion.h1>
                            <motion.p
                                className='text-2xl mb-12 text-yellow-400'
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                You've completed FaceQuest!
                            </motion.p>
                            <motion.button
                                onClick={resetGame}
                                className='press-start-2p-regular bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-8 rounded-lg text-xl transform transition-all duration-300 hover:scale-105'
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Play Again
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className='text-gray-500 mt-8 mb-4 text-center'>
                <p>©2025 FaceQuest. All rights reserved.</p>
                <p className='mt-2'>
                    <a href="https://github.com/OgAeons" className='hover:text-yellow-400 transition-colors duration-300'>
                        GitHub: OgAeons
                    </a>
                </p>
            </footer>
        </div>
    )
}

export default Game