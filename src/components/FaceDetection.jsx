import React, { useEffect, useRef, useState } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import * as cam from '@mediapipe/camera_utils'

function FaceDetection({level, setDetectedExpression}) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        const videoElement = videoRef.current
        const canvasElement = canvasRef.current
        const canvasCtx = canvasElement.getContext('2d')

        // Initialized FaceMesh model 
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
            // Clear canvas
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)

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
                setDetectedExpression(expression || 'no face')
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

    function detectExpression(landmarks) {
        const mouthOpen = landmarks[13].y - landmarks[14].y
        const leftEyeBlink = landmarks[159].y - landmarks[145].y
        const rightEyeBlink = landmarks[386].y - landmarks[374].y
        const mouthWidth = landmarks[308].x - landmarks[78].x
        const mouthHeight = landmarks[13].y - landmarks[14].y
        const headTilt = landmarks[234].x - landmarks[454].x

        // threshold for expressions
        const blinkLeftEyeThreshold = leftEyeBlink < -0.02 && leftEyeBlink > -0.06; // Fine-tune for left-eye blink
        const blinkRightEyeThreshold = rightEyeBlink < -0.02 && rightEyeBlink > -0.06; // Right-eye blink adjustment
        const turnHeadLeftThreshold = headTilt > 0.1; // Slightly easier to trigger
        const turnHeadRightThreshold = headTilt < -0.1;
        const smileThreshold = mouthWidth / mouthHeight > 1.5 && mouthOpen > 0.02; // Allow smaller smiles
        const sadThreshold = mouthWidth / mouthHeight < 1.2 && mouthOpen > 0.01; // Narrower mouth and slight openness
        const cryThreshold = sadThreshold && mouthOpen > 0.05; // Open mouth in sadness
        const surprisedThreshold =
        mouthOpen > 0.05 &&
        leftEyeBlink > -0.02 &&
        rightEyeBlink > -0.02 &&
        mouthWidth / mouthHeight < 1.8; // Open mouth and eyes, but not too wide
        const angryThreshold =
        mouthOpen > 0.03 &&
        leftEyeBlink < -0.03 &&
        rightEyeBlink < -0.03; // Strongly furrowed brows with open mouth
        const laughThreshold = smileThreshold && mouthOpen > 0.08; // Wide smile and open mouth

        
        console.log('Threshold Debug:', {
            mouthOpen,
            leftEyeBlink,
            rightEyeBlink,
            mouthWidth,
            mouthHeight,
            headTilt,
            smileThreshold,
            sadThreshold,
            cryThreshold,
            surprisedThreshold,
            angryThreshold,
            laughThreshold,
            blinkLeftEyeThreshold,
            blinkRightEyeThreshold,
            turnHeadLeftThreshold,
            turnHeadRightThreshold
        });

        
        if (smileThreshold) return 'smile'
        else if (laughThreshold) return 'laugh'
        else if (cryThreshold) return 'cry'
        else if (surprisedThreshold) return 'surprised';
        else if (sadThreshold) return 'sad';
        else if (angryThreshold) return 'angry';
        else if (blinkLeftEyeThreshold) return 'blink left eye';
        else if (blinkRightEyeThreshold) return 'blink right eye';
        else if (turnHeadLeftThreshold) return 'turn your head left';
        else if (turnHeadRightThreshold) return 'turn your head right';
        else return 'neutral'
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