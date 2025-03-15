import { motion } from "framer-motion";

const Integration = () => {
  const integrations = [
    {
      name: "Spotify",
      logo: (
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
            stroke="#1DB954"
            strokeWidth="1.5"
          />
          <path
            d="M16.5 12C16.5 12 14 14.5 9.5 13.5C7.5 13 6.5 12 6.5 12"
            stroke="#1DB954"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16.5 9C16.5 9 13.5 11.5 9.5 10.5C7.5 10 6.5 9 6.5 9"
            stroke="#1DB954"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16.5 15C16.5 15 14 17 9.5 16C7.5 15.5 6.5 15 6.5 15"
            stroke="#1DB954"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      description:
        "Access millions of tracks and control playback in real-time.",
    },
    {
      name: "Google",
      logo: (
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
            fill="#F1F1F1"
          />
          <path
            d="M12 4.5C13.6569 4.5 15.2355 5.02678 16.5001 5.96447C17.7648 6.90215 18.6411 8.20262 18.9777 9.67376C19.3142 11.1449 19.0925 12.6856 18.3494 14.0089C17.6064 15.3321 16.3879 16.359 14.9199 16.9145C13.4519 17.47 11.843 17.5169 10.3462 17.0483C8.84937 16.5797 7.56497 15.6238 6.74129 14.3439C5.91762 13.064 5.60077 11.5382 5.84632 10.0489C6.09187 8.55968 6.88255 7.20805 8.05026 6.21893L9.82918 8.59018C9.25212 9.0739 8.83939 9.72642 8.65177 10.4572C8.46415 11.188 8.51232 11.9599 8.78897 12.661C9.06562 13.3622 9.55752 13.9555 10.1929 14.3597C10.8282 14.7639 11.5765 14.9581 12.3358 14.9116C13.0951 14.8651 13.8154 14.5804 14.3949 14.0984C14.9743 13.6165 15.3832 12.9617 15.5607 12.2296C15.7382 11.4976 15.6748 10.7309 15.3797 10.0385C15.0847 9.34617 14.5724 8.76661 13.9199 8.37996L15.7019 5.99996C16.9641 6.91498 17.8999 8.23742 18.3602 9.76001C18.8205 11.2826 18.777 12.9128 18.236 14.4075C17.695 15.9022 16.6874 17.1742 15.3693 18.0255C14.0512 18.8769 12.4949 19.2631 10.9371 19.1211C9.37926 18.9791 7.91026 18.3168 6.75093 17.2298C5.5916 16.1428 4.80698 14.6914 4.51589 13.0983C4.22481 11.5053 4.44387 9.85652 5.13991 8.3857C5.83596 6.91488 6.97176 5.70025 8.39995 4.91996L12 4.5Z"
            fill="#EA4335"
          />
        </svg>
      ),
      description: "Quick, secure authentication and social sharing options.",
    },
  ];

  return (
    <section id="integrations" className="section gradient-bg relative">
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
            Seamless <span className="text-purple-400">Integrations</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Connect with your favorite services for the ultimate music
            experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div
                className="mb-6 p-6 rounded-full bg-dark-gray border-2 border-purple-500/20 shadow-lg"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(192, 132, 252, 0.4)",
                  borderColor: "rgba(192, 132, 252, 0.6)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {integration.logo}
              </motion.div>

              <h3 className="text-xl font-semibold font-poppins mb-2">
                {integration.name}
              </h3>
              <p className="text-gray-300 text-center">
                {integration.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xl text-purple-400 mb-6">
            More integrations coming soon!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Integration;
