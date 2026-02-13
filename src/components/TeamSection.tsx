const teamEmmanuel = "/team/team-emmanuel.avif";
const teamOwen = "/team/team-owen.avif";
const teamMaissa = "/team/team-maissa.avif";
const teamIan = "/team/team-ian.avif";
const teamDanosch = "/team/team-danosch.avif";
const teamHitesh = "/team/team-hitesh.avif";
const teamAlexia = "/team/team-alexia.avif";

const teamMembers = [
  {
    name: "Emmanuel Quezada",
    role: "Founder & Chief Executive Officer",
    image: teamEmmanuel,
    linkedin: "https://ae.linkedin.com/in/emmanuel-quezada/en",
  },
  {
    name: "Owen Man Cheong Ma",
    role: "Co-Founder & Chief Revenue Officer",
    image: teamOwen,
    linkedin: "https://sg.linkedin.com/in/omcma",
  },
  {
    name: "Maissa Ballout",
    role: "Chief Financial Officer",
    image: teamMaissa,
    linkedin: "https://il.linkedin.com/in/maissa-ballout-shamshoum",
  },
  {
    name: "Ian Stirling",
    role: "Chief Strategy Officer",
    image: teamIan,
    linkedin: "https://uk.linkedin.com/in/ianscottstirling",
  },
  {
    name: "Danosch Zahedi",
    role: "Regional Network Advisor",
    image: teamDanosch,
    linkedin: "https://ae.linkedin.com/in/danoschzahedi",
  },
  {
    name: "Hitesh Mishra",
    role: "Chief Compliance Officer",
    image: teamHitesh,
    linkedin: "https://hk.linkedin.com/in/hitesh-mishra-080786",
  },
  {
    name: "Alexia Chen",
    role: "BD APAC",
    image: teamAlexia,
    linkedin: "https://ae.linkedin.com/in/alexia-chen-264078305",
  },
];

const TeamSection = () => {
  // Split into two rows: first 4, then remaining 3
  const firstRow = teamMembers.slice(0, 4);
  const secondRow = teamMembers.slice(4);

  return (
    <section className="py-24 bg-[#0a0f1a]">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-5xl font-bold text-white mb-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              Meet the team behind U-topia
            </h2>
            <p 
              className="text-lg text-gray-400 max-w-3xl mx-auto opacity-0 animate-fade-in-up"
              style={{ animationDelay: '150ms' }}
            >
              We're supported by high-powered builders who value creative freedom and doing their best work. In past lives, we've led teams and projects at startups, large companies, and places in between.
            </p>
          </div>

          {/* First Row - 4 members */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {firstRow.map((member) => (
              <a
                key={member.name}
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
              >
                {/* Grayscale Image */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {member.role}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Second Row - 3 members, left-aligned */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {secondRow.map((member) => (
              <a
                key={member.name}
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
              >
                {/* Grayscale Image */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {member.role}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
