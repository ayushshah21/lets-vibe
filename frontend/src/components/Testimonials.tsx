import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Party Host",
    quote:
      "Let's Vibe completely transformed how I manage music at parties. Everyone gets to participate, and the vibe stays perfect all night!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sarah Martinez",
    role: "DJ & Music Lover",
    quote:
      "As someone who's always the designated DJ, this app is a game-changer. I can still curate the overall feel while letting friends contribute.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Jamal Wilson",
    role: "Event Planner",
    quote:
      "I've started recommending Let's Vibe to all my clients. It keeps guests engaged and creates a truly collaborative atmosphere.",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="section gradient-bg relative">
      <div className="hero-gradient opacity-30"></div>

      <div className="container relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
            What <span className="text-purple-400">People Say</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hear from people who have transformed their parties with our
            collaborative playlist
          </p>
        </motion.div>

        {/* Grid layout for testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="card neon-outline glass h-full flex"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center text-center h-full w-full justify-between py-6 px-4">
                <div className="mb-4 relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full border-2 border-purple-500/30 object-cover"
                  />
                  <div className="absolute inset-0 rounded-full shadow-lg shadow-purple-500/20"></div>
                </div>

                <svg
                  className="w-10 h-10 text-purple-500 opacity-30 mb-4"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 8c-4.418 0-8 3.582-8 8v8h8v-8h-6c0-3.314 2.686-6 6-6V8zM24 8c-4.418 0-8 3.582-8 8v8h8v-8h-6c0-3.314 2.686-6 6-6V8z"></path>
                </svg>

                <p className="text-lg text-gray-200 italic mb-6 flex-grow">
                  {testimonial.quote}
                </p>

                <div className="mt-auto">
                  <h4 className="text-xl font-semibold font-poppins">
                    {testimonial.name}
                  </h4>
                  <p className="text-purple-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
