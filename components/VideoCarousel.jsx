'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function VideoCarousel() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProductsWithVideos()
    }, [])

    const fetchProductsWithVideos = async () => {
        try {
            const response = await axios.get('/api/products/with-videos')
            setVideos(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch videos:', error)
            setLoading(false)
        }
    }

    if (loading) {
        return null
    }

    if (videos.length === 0) {
        return null
    }

    return (
        <div className="w-full py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="relative overflow-hidden">
                    {/* Left gradient */}
                    <div className="absolute left-0 top-0 h-full w-12 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                    
                    {/* Scrolling container */}
                    <div 
                        id="video-scroll-container"
                        className="flex gap-4"
                        style={{
                            animation: 'marqueeLeft 40s linear infinite',
                        }}
                    >
                        {[...videos, ...videos].map((video, index) => (
                            <div 
                                key={`${video.id}-${index}`}
                                className="flex-shrink-0 w-80"
                            >
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                                    controlsList="nodownload"
                                >
                                    <source src={video.videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                                <p className="text-gray-800 text-sm mt-2 truncate">{video.name}</p>
                            </div>
                        ))}
                    </div>
                    
                    {/* Right gradient */}
                    <div className="absolute right-0 top-0 h-full w-12 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
                </div>
            </div>
        </div>
    )
}
