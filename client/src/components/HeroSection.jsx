import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSliders } from "../utils/api";

const HeroSection = () => {
  const [sliders, setSliders] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const defaultSliders = [
    {
      _id: "fallback-1",
      title: "Empowering Communities, Transforming Lives",
      subtitle:
        "Manav Seva India works to uplift vulnerable communities through healthcare, education, social protection, and humanitarian initiatives.",
      image: "/images/hero1.jpg",
      buttonText: "Learn More",
      buttonLink: "/about",
    },
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSliders();
        if (res?.data && res.data.length) setSliders(res.data);
        else setSliders(defaultSliders);
      } catch (err) {
        console.error("Failed to load sliders", err);
        setSliders(defaultSliders);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!sliders.length) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % sliders.length), 5000);
    return () => clearInterval(id);
  }, [sliders]);

  const next = () => setCurrent((c) => (c + 1) % sliders.length);
  const prev = () => setCurrent((c) => (c - 1 + sliders.length) % sliders.length);

  if (loading) {
    return (
      <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  if (!sliders.length) return null;

  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden">
      {/* Slides */}
      {sliders.map((s, i) => (
        <div
          key={s._id || i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/45"></div>
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4 z-20">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">
          {sliders[current]?.title}
        </h1>
        <p className="mt-4 text-sm md:text-lg max-w-2xl opacity-90">
          {sliders[current]?.subtitle}
        </p>
        <div className="mt-6 flex gap-4">
          <Link to={sliders[current]?.buttonLink || "/about"} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md">
            {sliders[current]?.buttonText || "Learn More"}
          </Link>
          <Link to="/contact" className="px-6 py-3 border-2 border-white hover:bg-white hover:text-black rounded-lg">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Controls */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full z-30">
        ❮
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/70 p-3 rounded-full z-30">
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 flex justify-center w-full gap-2 z-30">
        {sliders.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              i === current ? "bg-white w-8" : "bg-white/50"
            }`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
