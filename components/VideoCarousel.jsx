'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function VideoCarousel() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [scrollPosition, setScrollPosition] = useState(0)

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

    // Continuous scroll animation
    useEffect(() => {
        if (videos.length === 0) return

        let animationFrameId
        let currentScroll = 0
        const scrollContainer = document.getElementById('video-scroll-container')
        
        if (!scrollContainer) return

        const totalWidth = scrollContainer.scrollWidth
        const containerWidth = scrollContainer.clientWidth
        const scrollableWidth = totalWidth - containerWidth

        const animate = () => {
            currentScroll += 0.3 // Smooth continuous scroll
            
            if (currentScroll > scrollableWidth) {
                currentScroll = 0 // Loop back to start
            }
            
            scrollContainer.scrollLeft = currentScroll
            setScrollPosition(currentScroll)
            animationFrameId = requestAnimationFrame(animate)
        }

        animationFrameId = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrameId)
    }, [videos])

    if (loading) {
        return null
    }

    if (videos.length === 0) {
        return null
    }

    return (
        <div className="bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-white text-2xl font-bold mb-6">Featured Videos</h2>
                
                <div 
                    id="video-scroll-container"
                    className="flex gap-4 overflow-x-hidden scroll-smooth"
                    style={{ scrollBehavior: 'auto' }}
                >
                    {videos.map((video, index) => (
                        <div 
                            key={`${video.id}-${index}`}
                            className="flex-shrink-0 w-80 h-48"
                        >
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover rounded-lg shadow-lg"
                                controlsList="nodownload"
                            >
                                <source src={video.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <p className="text-white text-sm mt-2 truncate">{video.name}</p>
                        </div>
                    ))}
                    
                    {/* Duplicate videos for seamless loop */}
                    {videos.map((video, index) => (
                        <div 
                            key={`${video.id}-duplicate-${index}`}
                            className="flex-shrink-0 w-80 h-48"
                        >
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover rounded-lg shadow-lg"
                                controlsList="nodownload"
                            >
                                <source src={video.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <p className="text-white text-sm mt-2 truncate">{video.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
