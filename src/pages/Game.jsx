import React, { useEffect, useState } from 'react'
import FaceDetection from '../components/faceDetection'

function Game() {
    const expressions = ['left eye closed', 'right eye closed', 'head turned left', 'head turned right', 'smile', 'sad', 'cry', 'surprised', 'angry', 'laugh', 'neutral']

    const [score, setScore] = useState(0)
    const [level, setLevel] = useState(1)
    const [accuracy, setAcuracy] = useState(0)
    const [gameStart, setGameStart] = useState(false)
    const [targetExpression, setTargetExpression] = useState(expressions[0])
    const [detectedExpression, setDetectedExpression] = useState('')

    if (detectedExpression === targetExpression) {
        handleLevelCompletion()
    }

    function toggleGame() {
        setGameStart(!gameStart)
    }

    function handleLevelCompletion() {
        setScore(prevScore => prevScore + 10)
        if(level < expressions.length -1) {
            setLevel(prevLevel => prevLevel + 1)
            setTargetExpression(expressions[level])
        } else {
            alert("Congratulations! You've completed all levels!!")
        }
    }

    return (
        <div className='bg-gray-900 min-h-screen h-screen flex flex-col items-center'>
            <h1 className='text-white text-4xl font-bold p-8'>Face<span className='text-yellow-400'>Quest</span></h1>
            <div className='flex flex-col flex-grow justify-center items-center'>
                {gameStart === true ? (
                    <div className='text-white flex flex-col justify-center items-center'>
                        <div>Level: {level}</div>
                        <div>Score: {score}</div>
                        <div>Accuracy: {accuracy}%</div>
                        <div>Minimum score to pass: 50</div>
                        <div>Target Expression: {targetExpression}</div>
                        <div>Detected Expression: {detectedExpression || 'None'}</div>
                        <FaceDetection 
                            level={level}
                            setDetectedExpression={setDetectedExpression}
                        />
                    </div>
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

export default Game