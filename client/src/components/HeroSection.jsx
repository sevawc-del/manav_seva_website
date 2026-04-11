import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSliders } from "../utils/api";
import { optimizeCloudinaryImage } from "../utils/imageUrl";

const HERO_SECTION_CLASS =
  "relative w-full overflow-hidden h-[clamp(20rem,58svh,34rem)] md:h-[clamp(26rem,70svh,46rem)] xl:h-[clamp(30rem,80svh,56rem)]";

const DEFAULT_SLIDERS = [
  {
    _id: "1",
    title: "Empowering Communities, Transforming Lives",
    subtitle:
      "Manav Seva India works to uplift vulnerable communities through healthcare, education, social protection, and humanitarian initiatives.",
    image: "/images/hero1.jpg",
    buttonText: "Learn More",
    buttonLink: "/about/about-us"
  }
];

const HeroSection = () => {
  const [sliders, setSliders] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await getSliders();
        if (response.data && response.data.length > 0) {
          setSliders(response.data);
        } else {
          setSliders(DEFAULT_SLIDERS);
        }
      } catch (error) {
        console.error("Failed to fetch sliders:", error);
        setSliders(DEFAULT_SLIDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [sliders.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <section className={`${HERO_SECTION_CLASS} bg-gray-200`}>
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
    <section className={HERO_SECTION_CLASS}>
      {sliders.map((slider, index) => (
        <div
          key={slider._id || index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={optimizeCloudinaryImage(slider.image, { width: 1920, height: 1080, crop: "fill" }) || slider.image}
            alt={slider.title || "Home slider image"}
            className="w-full h-full object-cover"
            loading={index === current ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index === current ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col justify-end md:justify-center items-center text-center text-white px-4 pb-20 md:pb-0 z-10">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg animate-fadeIn">
          {sliders[current]?.title}
        </h1>

        <p className="mt-3 md:mt-4 text-sm md:text-lg max-w-xl md:max-w-2xl opacity-90 animate-fadeIn delay-200">
          {sliders[current]?.subtitle}
        </p>

        <div className="mt-5 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-4 animate-fadeIn delay-300">
          <Link
            to={sliders[current]?.buttonLink || "/about/about-us"}
            className="px-6 py-3 bg-[var(--ngo-primary)] hover:bg-[var(--ngo-primary-strong)] rounded-lg shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ngo-primary-strong)]"
          >
            {sliders[current]?.buttonText || "Learn More"}
          </Link>

          <Link
            to="/contact"
            className="px-6 py-3 border-2 border-white hover:bg-white hover:text-black rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
          >
            Contact Us
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
        aria-label="Previous slide"
      >
        {"<"}
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
        aria-label="Next slide"
      >
        {">"}
      </button>

      <div className="absolute bottom-6 flex justify-center w-full gap-2 z-20">
        {sliders.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`h-3 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 ${
              index === current ? "bg-white w-8" : "bg-white/50 w-3"
            }`}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
