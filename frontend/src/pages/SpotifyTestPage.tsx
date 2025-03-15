import SpotifyAuth from "../components/SpotifyAuth";

const SpotifyTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Spotify Integration Test
        </h1>
        <SpotifyAuth />
      </div>
    </div>
  );
};

export default SpotifyTestPage;
