'use client'

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from 'react'

const Greeting = () => {
    const { user } = useAuth()
    const [greeting, setGreeting] = useState('')
    const [timeOfDay, setTimeOfDay] = useState('')

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours()
            let greetingText = ''
            let timeOfDayText = ''

            if (hour >= 5 && hour < 12) {
                greetingText = 'Good Morning'
                timeOfDayText = '🌅'
            } else if (hour >= 12 && hour < 17) {
                greetingText = 'Good Afternoon'
                timeOfDayText = '☀️'
            } else if (hour >= 17 && hour < 21) {
                greetingText = 'Good Evening'
                timeOfDayText = '🌆'
            } else {
                greetingText = 'Good Night'
                timeOfDayText = '🌙'
            }

            setGreeting(greetingText)
            setTimeOfDay(timeOfDayText)
        }

        updateGreeting()
        const interval = setInterval(updateGreeting, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='mx-6 mb-6'>
            <div className='max-w-7xl mx-auto'>
                <div className='bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 sm:p-8 shadow-md border border-green-100'>
                    <div className='flex items-center gap-3 sm:gap-4'>
                        <span className='text-4xl sm:text-5xl'>{timeOfDay}</span>
                        <div>
                            <p className='text-2xl sm:text-3xl font-bold text-slate-800'>
                                {greeting}
                                {user && (
                                    <span className='text-red-600'>, {user.firstName || user.username}!</span>
                                )}
                            </p>
                            <p className='text-sm sm:text-base text-slate-600 mt-1'>
                                Welcome to JeesCage - Your favorite shopping destination
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Greeting
