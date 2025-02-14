import React, { useEffect, useRef, useState } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import * as cam from '@mediapipe/camera_utils'

function FaceDetection({ level, setDetectedExpression, setAccuracy }) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const [expressionArray, setExpressionArray] = useState([])      // stores an array of recent expressions
    const expressionArrayMaxLength = 20
    const confidenceThreshold = 0.7

    useEffect(() => {
        const videoElement = videoRef.current
        const canvasElement = canvasRef.current
        const canvasCtx = canvasElement.getContext('2d')

        // initialized FaceMesh model 
        const faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        })
        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        })

        faceMesh.onResults((results) => {
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)    // Clear canvas

            // Flip the canvas horizontally
            canvasCtx.save()
            canvasCtx.scale(-1, 1)
            canvasCtx.translate(-canvasElement.width, 0)

            // Draw video frame on canvas
            canvasCtx.drawImage(
                results.image,
                0,
                0,
                canvasElement.width,
                canvasElement.height
            )

            // Draw face landmarks
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                for (const landmarks of results.multiFaceLandmarks) {
                    drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_TESSELATION, {
                        color: '#C0C0C070',
                        lineWidth: 1,
                    })
                    drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 2.5 })
                }

                const expression = detectExpression(results.multiFaceLandmarks[0])
                updateExpressionArray(expression)
                // setDetectedExpression(expression || 'no face')
            }

            // restore the canvas to its original state
            canvasCtx.restore() 
        })

        // webcam video
        let camera

        if (typeof videoElement !== 'undefined' && videoElement !== null) {
            camera = new cam.Camera(videoElement, {
                onFrame: async () => {
                await faceMesh.send({ image: videoElement })
                },
                width: 640,
                height: 480,
            })
            camera.start()
        }

        return () => {
            if (camera) {
                camera.stop()
            }
            // stop and reset video stream
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach((track) => track.stop())
            }
          }
    }, [level])
    

    function updateExpressionArray(expression) {
        setExpressionArray((prevExpression) => {
            const updatedExpressionArray = [...prevExpression, expression].slice(-expressionArrayMaxLength)

            const expressionCount = updatedExpressionArray.reduce((count, exp) => {
                count[exp] = (count[exp] || 0) + 1
                return count
            }, {})
            const accuracy = (expressionCount[expression] / expressionArrayMaxLength ) * 100
            setAccuracy(accuracy)

            const mostConfidentExpression = Object.keys(expressionCount).reduce((a, b) =>
                expressionCount[a] > expressionCount[b] ? a : b
            )

            const confidence = expressionCount[mostConfidentExpression] / updatedExpressionArray.length

            if( confidence >= confidenceThreshold) {
                setDetectedExpression(mostConfidentExpression)
            }

            // console.log('Updated Expression Array:', updatedExpressionArray)
            return updatedExpressionArray
        }) 
    }

    function detectExpression(landmarks) {
        const closeLeftEye = landmarks[386].y - landmarks[374].y
        const closeRightEye = landmarks[159].y - landmarks[145].y
        const mouthWidth = landmarks[308].x - landmarks[78].x
        const mouthHeight = landmarks[13].y - landmarks[14].y
        const faceTurnedRight = landmarks[234].x - landmarks[127].x 
        const faceTurnedLeft = landmarks[356].x - landmarks[454].x 
        const headTilt = landmarks[234].x - landmarks[454].x
        const mouthMidpoint = landmarks[13].x
        const mouthCornersDown = landmarks[308].x < mouthMidpoint || landmarks[78].x < mouthMidpoint

        // threshold for expressions
        const leftEyeClosed = closeLeftEye > -0.01
        const rightEyeClosed = closeRightEye > -0.01
        const smileThreshold = mouthWidth > 0.1 && mouthHeight < 0.0001 
        const sadThreshold = mouthWidth < 0.1 && mouthHeight >= 0.0001 && mouthCornersDown 
        const surprisedThreshold = Math.abs(mouthHeight) > 0.07 && !leftEyeClosed && !rightEyeClosed

        const neutralFace = Math.abs(headTilt) > 0.25 && Math.abs(headTilt) < 0.3 && !leftEyeClosed && !rightEyeClosed && !smileThreshold && !sadThreshold

        // const angryThreshold =
        // mouthOpen > 0.03 
        // // &&
        // // leftEyeBlink < -0.03 &&
        // // rightEyeBlink < -0.03; 
        // const laughThreshold = smileThreshold && mouthOpen > 0.08; 
        
        console.log('Threshold Debug:', {
            mouthCornersDown,
            mouthMidpoint,
            headTilt,
            closeLeftEye,
            closeRightEye,
            mouthWidth,
            mouthHeight,
            smileThreshold,
            sadThreshold,
            surprisedThreshold,
            // angryThreshold,
            // laughThreshold,
        })

        if(sadThreshold) return 'sad face'
        if(surprisedThreshold) return 'surprised face'
        if(neutralFace) return 'neutral face'
        if(smileThreshold) return 'smile'
        if(leftEyeClosed) return 'left eye closed'
        if(rightEyeClosed) return 'right eye closed'
        if(faceTurnedLeft > faceTurnedRight) return 'head turned left'
        if(faceTurnedLeft < faceTurnedRight) return 'head turned right'
    }
    

    return (
        <div>
            <video
                ref={videoRef}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: -1,
                    visibility: 'hidden', 
                    width: '640px',
                    height: '480px',
                }}
                playsInline
            />

            <canvas
                ref={canvasRef}
                style={{
                    border: '1px solid black',
                    width: '640px',
                    height: '480px',
                }}
                width="640"
                height="480"
            />
        </div>
    )
}

export default FaceDetection