import { motion } from 'motion/react'
import { ChevronRight, UtensilsCrossed, Truck, Star, Users, Clock, Shield, Heart, Globe } from 'lucide-react'

const stats = [
  { label: 'Restaurants', value: '500+', icon: UtensilsCrossed },
  { label: 'Cities', value: '15+', icon: Globe },
  { label: 'Daily Orders', value: '10K+', icon: Truck },
  { label: 'Happy Users', value: '50K+', icon: Users }
]

const values = [
  {
    icon: Star,
    title: 'Quality First',
    description: 'We partner with the best restaurants and ensure every meal meets our quality standards.'
  },
  {
    icon: Clock,
    title: 'Fast & Reliable',
    description: 'Real-time tracking and accurate delivery estimates so you always know when to expect your food.'
  },
  {
    icon: Heart,
    title: 'Customer Love',
    description: 'Your satisfaction is our priority. We\'re here to make every meal experience exceptional.'
  },
  {
    icon: Shield,
    title: 'Safety Guarantee',
    description: 'Contactless delivery and strict hygiene protocols to keep you and your food safe.'
  }
]

const team = [
  {
    name: 'Sandeep Aryan',
    role: 'Founder & CEO',
    image: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Operations',
    image: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    name: 'Rahul Verma',
    role: 'CTO',
    image: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    name: 'Ananya Reddy',
    role: 'Head of Marketing',
    image: 'https://randomuser.me/api/portraits/women/4.jpg'
  }
]

export function About() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Hero */}
        <div className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-tomato/10 px-4 py-1.5 text-sm font-semibold text-tomato">
            About Us
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-charcoal sm:text-5xl">
            Delivering Happiness,
            <br />
            <span className="text-tomato">One Meal at a Time</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-warm-gray">
            SanFoody is on a mission to connect people with the best food experiences
            in their city. We believe great food brings people together.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-3xl border border-charcoal/5 bg-white p-6 text-center shadow-soft"
            >
              <stat.icon className="mx-auto h-6 w-6 text-tomato" />
              <p className="mt-2 font-display text-2xl font-extrabold text-charcoal">{stat.value}</p>
              <p className="text-sm text-warm-gray">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-16 overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft">
          <div className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-2 sm:p-12">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-tomato">Our Story</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-charcoal">
                From a Simple Idea to a Food Revolution
              </h2>
              <p className="mt-4 text-warm-gray">
                SanFoody was born from a simple observation: ordering food should be effortless,
                enjoyable, and reliable. What started as a small project in Mumbai has grown
                into a platform that connects thousands of people with their favourite meals.
              </p>
              <p className="mt-3 text-warm-gray">
                Today, we're proud to partner with over 500 restaurants across 15+ cities,
                delivering delicious food to hungry customers every single day.
              </p>
            </div>
            <div className="relative h-48 overflow-hidden rounded-2xl sm:h-auto">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&h=600&q=80"
                alt="SanFoody Story"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-charcoal/5 to-transparent" />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-charcoal">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft transition-shadow hover:shadow-warm"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-tomato/10 p-2.5">
                      <Icon className="h-5 w-5 text-tomato" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal">{value.title}</h3>
                      <p className="mt-1 text-sm text-warm-gray">{value.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-charcoal">
            Meet the Team
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="mx-auto h-24 w-24 rounded-full object-cover sm:h-32 sm:w-32"
                />
                <p className="mt-3 font-semibold text-charcoal">{member.name}</p>
                <p className="text-sm text-warm-gray">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-tomato to-orange p-12 text-center text-cream">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Hungry? Let's Get You Fed!
            </h2>
            <p className="mt-2 text-cream/80">Discover amazing food from the best restaurants in your city.</p>
            <a
              href="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-8 py-3 text-sm font-bold text-tomato shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Restaurants
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}