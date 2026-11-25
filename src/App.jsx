import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <AppRoutes />
      </PlayerProvider>
    </AuthProvider>
  );
}
