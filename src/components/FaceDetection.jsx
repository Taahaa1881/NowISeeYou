import React, { useEffect, useRef } from "react"
import * as tf from "@tensorflow/tfjs"
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection"

const FaceDetection = () => {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        async function loadModel() {
            const model = await faceLandmarksDetection.createDetector(
                faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
                {
                    runtime: "mediapipe",
                    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
                    wasmPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_wasm_bin.js",
                }
            )
            startVideo(model)
        }

        async function startVideo(model) {
            const video = videoRef.current

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                })
                video.srcObject = stream
                video.onloadedmetadata = () => {
                    video.play()

                    // Match canvas size with video
                    const canvas = canvasRef.current
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight

                    detectFaces(model, video)
                }
            } catch (err) {
                console.error("Error accessing webcam: ", err)
            }
        }

        async function detectFaces(model, video) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")

            async function detect() {
                const predictions = await model.estimateFaces(video)

                // Clear canvas and draw video frame
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                if (predictions.length > 0) {
                    predictions.forEach((prediction) => {
                        const keypoints = prediction.keypoints

                        // Draw landmarks
                        keypoints.forEach(({ x, y }) => {
                            ctx.beginPath()
                            ctx.arc(x, y, 2, 0, 2 * Math.PI)
                            ctx.fillStyle = "red"
                            ctx.fill()
                        })
                    })
                }

                requestAnimationFrame(detect)
            }
            detect()
        }

        loadModel()
    }, [])

    return (
        <div className="relative w-full h-full flex justify-center items-center">
            <video
                ref={videoRef}
                className="border rounded-lg"
                style={{ width: "640px", height: "480px" }}
                autoPlay
                muted
            />
            <canvas
                ref={canvasRef}
                // className="absolute top-0 left-0"
                style={{ width: "640px", height: "480px" }}
            ></canvas>
        </div>
    )
}

export default FaceDetection
