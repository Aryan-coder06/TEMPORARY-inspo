import "./globals.css";
import "./sponsors.css";
import "./journey.css";
import "./flow-fix.css";

export const metadata = {
  title: "OpenCode '26 — GeekHaven",
  description: "The next frontier of open source.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
