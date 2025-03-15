import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export const SearchBar = ({ onSearch, isSearching }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onSearch(value);
    },
    [onSearch]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        className={`
          relative flex items-center gap-3 p-4
          bg-white/[0.05] backdrop-blur-xl 
          rounded-2xl border 
          ${
            isFocused
              ? "border-purple-400/50 shadow-lg shadow-purple-500/20"
              : "border-white/[0.05]"
          }
          transition-all duration-300
        `}
      >
        <motion.div
          initial={false}
          animate={isSearching ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 1,
            repeat: isSearching ? Infinity : 0,
            ease: "linear",
          }}
        >
          <svg
            className={`w-6 h-6 ${
              isSearching ? "text-purple-400" : "text-white/40"
            }`}
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </motion.div>

        <input
          type="text"
          value={inputValue}
          placeholder="Search for songs..."
          className="
            flex-1 bg-transparent text-white placeholder-white/40
            focus:outline-none text-lg
          "
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleInputChange}
        />

        <AnimatePresence>
          {isFocused && inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setInputValue("");
                onSearch("");
              }}
              className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white/60 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
