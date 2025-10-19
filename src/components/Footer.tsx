import { Instagram, Github, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  const sections = [
    {
      title: "Usa nuestra",
      links: ["UI design", "UX design", "Wireframing", "Programming", "Branding/logo"],
    },
    {
      title: "Explora",
      links: ["Design", "Prototyping", "Development features", "Design systems", "Collaboration features"],
    },
    {
      title: "Recursos",
      links: ["Blog", "Best practices", "Colors", "Freelance", "Support"],
    },
  ];

  return (
    <footer className="bg-secondary/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <span className="text-2xl">🛒</span>
            </div>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
