import { motion } from "framer-motion";

const featuresList = [
  {
    title: "Real-time Voting",
    description:
      "Democratize your party experience. Let guests vote on songs in real time to shape the vibe.",
    icon: (
      <svg
        className="w-12 h-12 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 15l7-7 7 7"
        ></path>
      </svg>
    ),
  },
  {
    title: "Song Cooldown",
    description:
      "Prevent song repetition with automatic cooldown periods. Keep your playlist fresh and varied.",
    icon: (
      <svg
        className="w-12 h-12 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    ),
  },
  {
    title: "Spotify Integration",
    description:
      "Seamlessly connect with Spotify for access to millions of tracks and instant playlist control.",
    icon: (
      <svg
        className="w-12 h-12 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        ></path>
      </svg>
    ),
  },
  {
    title: "Secure Authentication",
    description:
      "Quick and secure sign-in with Google OAuth. No lengthy forms or password management.",
    icon: (
      <svg
        className="w-12 h-12 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        ></path>
      </svg>
    ),
  },
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="features" className="section gradient-bg relative">
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
            <span className="text-purple-400">Powerful</span> Features
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Our collaborative playlist app comes loaded with features that make
            managing your party's music effortless and fun.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featuresList.map((feature, index) => (
            <motion.div
              key={index}
              className="card neon-outline glass"
              variants={itemVariants}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 },
                boxShadow: "0 0 20px rgba(192, 132, 252, 0.2)",
              }}
            >
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold font-poppins mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
