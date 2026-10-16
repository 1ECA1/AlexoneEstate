
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Target,
  Eye,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust and transparency",
    description:
      "We believe property decisions should be supported by clear information and honest communication.",
  },
  {
    icon: HeartHandshake,
    title: "People first",
    description:
      "Every property search represents a person, a family, or a business with its own goals.",
  },
  {
    icon: Compass,
    title: "Thoughtful guidance",
    description:
      "We aim to make property discovery easier to navigate, from exploring listings to taking the next step.",
  },
  {
    icon: Building2,
    title: "Better possibilities",
    description:
      "We bring property opportunities together in one place so visitors can explore their options.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#20251f]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="px-5 pb-16 pt-16 sm:px-8 sm:pt-24 lg:pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-[#e8dfcd] bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[#82632e]">
                  About HavenEstate
                </span>

                <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Finding the right property should feel{" "}
                  <span className="text-[#a17b38]">different.</span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 sm:text-lg">
                  HavenEstate is designed to help people discover property
                  opportunities with a clearer, more thoughtful experience.
                  Whether you are looking to buy, rent, or explore an
                  investment, your next move starts with the right information.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/properties"
                    className="inline-flex items-center gap-2 rounded-full bg-[#20251f] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#343b32]"
                  >
                    Explore properties
                    <ArrowUpRight size={17} />
                  </Link>

                  <Link
                    to="/agents"
                    className="inline-flex items-center gap-2 rounded-full border border-[#dcd6c9] bg-white px-6 py-3.5 text-sm font-medium transition hover:border-[#a17b38]"
                  >
                    Meet our agents
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-[#e1c58a]/30 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem]">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
                    alt="Contemporary home with a welcoming modern design"
                    className="h-[360px] w-full object-cover sm:h-[480px] lg:h-[570px]"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/30 bg-white/90 p-5 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#82632e]">
                      Our approach
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      More clarity. More possibilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="border-y border-[#eeebe4] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a17b38]">
                Our story
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                A more considered way to explore real estate.
              </h2>
            </div>

            <div className="space-y-5 text-sm leading-8 text-gray-600 sm:text-base">
              <p>
                Finding a property is about more than walls, rooms, and
                addresses. It is about finding a place that supports the way
                you live, work, and plan for the future.
              </p>
              <p>
                HavenEstate brings property discovery into a focused,
                approachable experience. We want visitors to browse listings,
                compare possibilities, and connect with property professionals
                without unnecessary complexity.
              </p>
              <p>
                Our goal is to keep the experience clear and useful as we
                continue developing the platform for buyers, renters, agents,
                and property owners.
              </p>
            </div>
          </div>
        </section>

        {/* Mission and vision */}
        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
            <article className="rounded-3xl bg-[#20251f] p-7 text-white sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#e1c58a]">
                <Target size={24} />
              </div>
              <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-[#e1c58a]">
                Our mission
              </p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Make property discovery easier.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
                To create a practical, welcoming platform where people can
                explore real estate opportunities and take their next steps
                with greater confidence.
              </p>
            </article>

            <article className="rounded-3xl border border-[#e8dfcd] bg-[#f5f0e6] p-7 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#82632e]">
                <Eye size={24} />
              </div>
              <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-[#82632e]">
                Our vision
              </p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                A trusted place to begin your next move.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-gray-600 sm:text-base">
                To grow into a dependable real estate platform that connects
                people with useful property information, relevant
                opportunities, and professional guidance.
              </p>
            </article>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a17b38]">
                What guides us
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                The values behind HavenEstate
              </h2>
              <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
                The principles we want reflected in every part of the property
                discovery experience.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.title}
                    className="rounded-3xl border border-[#eeebe4] bg-[#faf9f6] p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f0e6] text-[#82632e]">
                      <Icon size={23} />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600">
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"
                alt="Bright, carefully designed residential interior"
                loading="lazy"
                className="h-[320px] w-full object-cover sm:h-[440px]"
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#a17b38]">
                The HavenEstate experience
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Everything starts with understanding what matters to you.
              </h2>
              <p className="mt-5 text-sm leading-7 text-gray-600 sm:text-base">
                Your property goals are personal. Our platform is being built
                around the essentials that help you explore the market and
                make your next decision.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  "Explore properties for sale and rent.",
                  "Review important listing details.",
                  "Discover property professionals.",
                  "Compare options based on your needs.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-gray-600 sm:text-base"
                  >
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-[#a17b38]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-16 sm:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#20251f] px-6 py-12 text-white sm:px-12 sm:py-16">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#e1c58a]">
              Start exploring
            </p>
            <div className="mt-4 flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your next place could be closer than you think.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/65 sm:text-base">
                  Explore the listings and discover possibilities with
                  HavenEstate.
                </p>
              </div>

              <Link
                to="/properties"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#e1c58a] px-6 py-3.5 text-sm font-semibold text-[#20251f] transition hover:bg-[#f0d9a7] md:self-auto"
              >
                Discover properties
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
