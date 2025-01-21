import React, { useState } from 'react'
import FaceDetection from '../components/faceDetection'

function Game() {
    const [score, setScore] = useState(0)
    const [level, setLevel] = useState(1)
    const [accuracy, setAcuracy] = useState(0)

    return (
        <div className='flex flex-col justify-center items-center'>
            <div>Level: {level}</div>
            <FaceDetection setScore={setScore} />
            <div className='mt-4'>
                <div>Score: {score}</div>
                <div>Accuracy: {accuracy}%</div>
                <div>Minimum score to pass: 50</div>
            </div>
        </div>
    )
}

export default Game