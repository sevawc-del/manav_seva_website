import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSliders } from "../utils/api";

const HeroSection = () => {
  const [sliders, setSliders] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Default fallback sliders (for when API is unavailable)
  const defaultSliders = [
    {
      _id: '1',
      title: 'Empowering Communities, Transforming Lives',
      subtitle: 'Manav Seva India works to uplift vulnerable communities through healthcare, education, social protection, and humanitarian initiatives.',
      image: '/images/hero1.jpg',
      buttonText: 'Learn More',
      buttonLink: '/about'
    }
  ];

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await getSliders();
        if (response.data && response.data.length > 0) {
          setSliders(response.data);
        } else {
          setSliders(defaultSliders);
        }
      } catch (error) {
        console.error('Failed to fetch sliders:', error);
        setSliders(defaultSliders);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [current, sliders.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  if (sliders.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden">

      {/* SLIDES */}
      {sliders.map((slider, index) => (
        <div
          key={slider._id || index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slider.image}
            alt={slider.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      ))}

      {/* CONTENT */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4 z-10">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg animate-fadeIn">
          {sliders[current]?.title}
        </h1>

        <p className="mt-4 text-sm md:text-lg max-w-2xl opacity-90 animate-fadeIn delay-200">
          {sliders[current]?.subtitle}
        </p>

        <div className="mt-6 flex gap-4 animate-fadeIn delay-300">
          <Link
            to={sliders[current]?.buttonLink || '/about'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
          >
            {sliders[current]?.buttonText || 'Learn More'}
          </Link>

          <Link
            to="/contact"
            className="px-6 py-3 border-2 border-white hover:bg-white hover:text-black rounded-lg transition"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* LEFT BUTTON */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full z-20"
      >
        ❮
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full z-20"
      >
        ❯
      </button>

      {/* DOTS */}
      <div className="absolute bottom-6 flex justify-center w-full gap-2 z-20">
        {sliders.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              index === current ? "bg-white w-8" : "bg-white/50"
            }`}
            onClick={() => setCurrent(index)}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
