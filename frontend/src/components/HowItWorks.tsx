import { motion } from "framer-motion";

const steps = [
  {
    title: "Connect",
    description:
      "Connect with your friends using Google for quick, secure access.",
    icon: (
      <svg
        className="w-16 h-16 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        ></path>
      </svg>
    ),
  },
  {
    title: "Add & Vote",
    description:
      "Add your favorite songs to the queue and vote for the ones you want to hear next.",
    icon: (
      <svg
        className="w-16 h-16 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    ),
  },
  {
    title: "Vibe Together",
    description:
      "Instantly control your party's vibe in real-time as everyone collaborates.",
    icon: (
      <svg
        className="w-16 h-16 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section gradient-bg relative">
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
            How It <span className="text-purple-400">Works</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Create your collaborative playlist in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600/0 via-purple-500/50 to-purple-600/0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative z-10 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="mb-6 rounded-full bg-dark-gray p-5 border-2 border-purple-500/30 shadow-lg shadow-purple-500/10">
                {step.icon}
              </div>

              <motion.div
                className="bg-dark-gray/80 rounded-xl p-6 card neon-outline w-full"
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                  boxShadow: "0 0 15px rgba(192, 132, 252, 0.25)",
                }}
              >
                <h3 className="text-xl font-semibold font-poppins mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>

              {/* Step number circles */}
              <div className="absolute top-1/2 transform -translate-y-24 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
