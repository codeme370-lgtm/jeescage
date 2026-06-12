import { useEffect, useRef, useState } from 'react';

export const useInViewAnimation = (options = {}) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                // Optional: stop observing after the element enters view
                observer.unobserve(entry.target);
            }
        }, {
            threshold: 0.1,
            ...options
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return { ref, isInView };
};
