import React, { useEffect, useRef, useState } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import * as cam from '@mediapipe/camera_utils'

function FaceDetection({setScore, score, setLevel, level}) {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const expressions = ['blink left eye', 'blink right eye', 'turn your head left', 'turn your head right', 'smile', 'sad', 'cry', 'surprised', 'angry', 'laugh', 'neutral']

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