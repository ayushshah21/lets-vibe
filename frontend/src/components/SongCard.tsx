import { motion } from "framer-motion";

interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  votes: number;
  position: number;
  uri: string;
  onVote: (id: string) => void;
  onPlay: (song: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    votes: number;
    uri: string;
  }) => void;
  isPlaying: boolean;
}

export const SongCard = ({
  id,
  title,
  artist,
  albumArt,
  votes,
  position,
  uri,
  onVote,
  onPlay,
  isPlaying,
}: SongCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-4 
        flex items-center gap-6 hover:bg-white/[0.07] transition-all duration-300 
        border border-white/[0.05] hover:border-white/[0.08]
        ${isPlaying ? "border-purple-500/30 bg-purple-500/5" : ""}
      `}
    >
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
        <span className="text-lg font-medium text-purple-300/40 font-mono">
          {position}
        </span>
      </div>

      <div className="relative">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={albumArt}
          alt={`${title} album art`}
          className="w-16 h-16 rounded-xl object-cover shadow-lg ring-1 ring-white/10"
        />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10"></div>
      </div>

      <div className="flex-grow min-w-0 space-y-1">
        <h3 className="text-white font-semibold text-lg tracking-wide truncate pr-4">
          {title}
        </h3>
        <p className="text-purple-300/60 truncate text-sm tracking-wide">
          {artist}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <motion.span
          key={votes}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-white/80 font-medium text-lg tabular-nums w-8 text-center"
        >
          {votes}
        </motion.span>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onVote(id)}
            className="group-hover:bg-purple-500/20 p-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </motion.svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlay({ id, title, artist, albumArt, votes, uri })}
            className={`
              group-hover:bg-purple-500/20 p-3 rounded-xl transition-all duration-300 
              hover:shadow-lg hover:shadow-purple-500/20
              ${isPlaying ? "bg-purple-500/30" : ""}
            `}
          >
            {isPlaying ? (
              <svg
                className="h-6 w-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
