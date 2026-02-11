'use client'

import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 3000);
    };

    const contactInfo = [
        {
            icon: Phone,
            title: "Phone",
            details: "+233 25 686 6043",
            description: "Monday - Friday, 9am - 6pm"
        },
        {
            icon: Mail,
            title: "Email",
            details: "contact@jeescage.com",
            description: "We'll respond within 24 hours"
        },
        {
            icon: MapPin,
            title: "Address",
            details: "K06 Kumasi, KNUST",
            description: "Ashanti Region, Ghana"
        },
        {
            icon: Clock,
            title: "Business Hours",
            details: "24/7 Support",
            description: "Available anytime for you"
        }
    ];

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">Get In Touch</h1>
                    <p className="text-xl max-w-2xl mx-auto">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-6">
                        {contactInfo.map((info, index) => {
                            const Icon = info.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
                                    <div className="flex justify-center mb-4">
                                        <Icon size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">{info.title}</h3>
                                    <p className="text-slate-800 font-medium text-center mb-1">{info.details}</p>
                                    <p className="text-slate-600 text-sm text-center">{info.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="bg-slate-50 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Form */}
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                                        placeholder="Jee Ma"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                                        placeholder="jeescage@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <Send size={18} />
                                    Send Message
                                </button>
                                {submitted && (
                                    <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                                        Thank you! We'll get back to you soon.
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Map or Additional Info */}
                        <div className="bg-white rounded-lg p-8 shadow-md">
                            <h3 className="text-2xl font-bold text-slate-800 mb-6">Why Contact Us?</h3>
                            <div className="space-y-4">
                                <div className="border-l-4 border-green-600 pl-4">
                                    <h4 className="font-semibold text-slate-800 mb-1">Product Inquiries</h4>
                                    <p className="text-slate-600">Have questions about our products? We're here to help you find the perfect gadget.</p>
                                </div>
                                <div className="border-l-4 border-green-600 pl-4">
                                    <h4 className="font-semibold text-slate-800 mb-1">Order Support</h4>
                                    <p className="text-slate-600">Need help with your order? Our support team is ready to assist you.</p>
                                </div>
                                <div className="border-l-4 border-green-600 pl-4">
                                    <h4 className="font-semibold text-slate-800 mb-1">Partnership Opportunities</h4>
                                    <p className="text-slate-600">Interested in partnering with us? Let's discuss how we can work together.</p>
                                </div>
                                <div className="border-l-4 border-green-600 pl-4">
                                    <h4 className="font-semibold text-slate-800 mb-1">Feedback & Suggestions</h4>
                                    <p className="text-slate-600">Your feedback helps us improve. Share your thoughts with us anytime.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">Frequently Asked Questions</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        <details className="bg-slate-50 rounded-lg p-6 cursor-pointer hover:bg-slate-100 transition">
                            <summary className="font-semibold text-slate-800 flex items-center justify-between">
                                How long does delivery take?
                                <span className="text-green-600">+</span>
                            </summary>
                            <p className="text-slate-600 mt-4">Standard delivery takes 3-5 business days. Express delivery options are also available for faster service.</p>
                        </details>
                        <details className="bg-slate-50 rounded-lg p-6 cursor-pointer hover:bg-slate-100 transition">
                            <summary className="font-semibold text-slate-800 flex items-center justify-between">
                                What is your return policy?
                                <span className="text-green-600">+</span>
                            </summary>
                            <p className="text-slate-600 mt-4">We offer a 30-day return policy on most products. Items must be in original condition with all packaging.</p>
                        </details>
                        <details className="bg-slate-50 rounded-lg p-6 cursor-pointer hover:bg-slate-100 transition">
                            <summary className="font-semibold text-slate-800 flex items-center justify-between">
                                Do you have a warranty?
                                <span className="text-green-600">+</span>
                            </summary>
                            <p className="text-slate-600 mt-4">Yes, all products come with manufacturer warranty. Extended warranty options are available for select items.</p>
                        </details>
                        <details className="bg-slate-50 rounded-lg p-6 cursor-pointer hover:bg-slate-100 transition">
                            <summary className="font-semibold text-slate-800 flex items-center justify-between">
                                What payment methods do you accept?
                                <span className="text-green-600">+</span>
                            </summary>
                            <p className="text-slate-600 mt-4">We accept credit cards, debit cards, and Paystack payments. All transactions are secure and encrypted.</p>
                        </details>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
