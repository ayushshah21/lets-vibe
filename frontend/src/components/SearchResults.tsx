import { motion, AnimatePresence } from "framer-motion";

interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  votes: number;
  uri?: string;
  durationMs?: number;
}

interface SearchResultsProps {
  results: Song[];
  onAdd: (song: Song) => void;
  isVisible: boolean;
}

export const SearchResults = ({
  results,
  onAdd,
  isVisible,
}: SearchResultsProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute left-0 right-0 mt-2 max-h-[60vh] overflow-auto rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 shadow-2xl z-50"
        >
          {results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-white/60 text-center"
            >
              No songs found
            </motion.div>
          ) : (
            <div className="p-3 space-y-2">
              {results.map((song) => (
                <motion.div
                  key={song.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative p-3 rounded-xl hover:bg-white/5 transition-colors duration-300 cursor-pointer"
                  onClick={() => onAdd(song)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={song.albumArt}
                      alt={`${song.title} album art`}
                      className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {song.title}
                      </h4>
                      <p className="text-white/60 text-sm truncate">
                        {song.artist}
                      </p>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
