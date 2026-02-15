'use client'

import Link from "next/link";
import { Award, Users, Zap, Globe } from "lucide-react";

const AboutPage = () => {
    const features = [
        {
            icon: Zap,
            title: "Fast Delivery",
            description: "Quick and reliable delivery right to your doorstep"
        },
        {
            icon: Users,
            title: "Expert Team",
            description: "Knowledgeable staff ready to help you find the perfect gadget"
        },
        {
            icon: Award,
            title: "Quality Products",
            description: "Curated selection of authentic and high-quality tech products"
        },
        {
            icon: Globe,
            title: "Wide Selection",
            description: "Everything from smartphones to home appliances in one place"
        }
    ];

    const team = [
        {
            name: "Owusu Jemaima",
            role: "CEO & Founder",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        },
        {
            name: "Jane Ansah",
            role: "Head of Operations",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        },
        {
            name: "Mike Agyenim",
            role: "Product Manager",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
        },
        {
            name: "Yaw Asamoah",
            role: "Customer Service Lead",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        }
    ];

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">About jeescage</h1>
                    <p className="text-xl max-w-2xl mx-auto">Your trusted destination for the latest gadgets and innovative tech products</p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Story</h2>
                            <p className="text-slate-600 mb-4 text-lg">
                                Founded in 2024, jeescage started with a simple mission: to make cutting-edge technology accessible to everyone. We believe that gadgets shouldn't be complicated, expensive, or hard to find.
                            </p>
                            <p className="text-slate-600 mb-4 text-lg">
                                What began as a small startup has grown into a trusted platform serving thousands of customers. We've built our reputation on quality, reliability, and exceptional customer service.
                            </p>
                            <p className="text-slate-600 text-lg">
                                Today, jeescage is the go-to marketplace for gadgets across multiple categories, from smartphones and laptops to home appliances and accessories.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-12 h-96 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-green-600 mb-4">5K+</div>
                                <p className="text-slate-700 text-xl">Happy Customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-slate-50 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">Why Choose Us</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition">
                                    <div className="flex justify-center mb-4">
                                        <Icon size={40} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section 
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">Our Team</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                                <div className="h-64 bg-slate-200 overflow-hidden">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-lg font-semibold text-slate-800">{member.name}</h3>
                                    <p className="text-green-600 text-sm">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            */}
            

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Explore?</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">Discover our wide selection of gadgets and find exactly what you need</p>
                    <Link href="/shop" className="inline-block bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition">
                        Shop Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
