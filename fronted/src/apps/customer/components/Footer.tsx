import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Company',
    links: ['About us', 'Careers', 'Press', 'Blog'],
  },
  {
    title: 'Explore',
    links: ['Restaurants', 'Cuisines', 'Collections', 'Offers', 'Gift cards'],
  },
  {
    title: 'Support',
    links: ['Help center', 'Track order', 'Contact us', 'Partner with us'],
  },
  {
    title: 'Legal',
    links: ['Terms of service', 'Privacy policy', 'Refund policy', 'Cookie policy'],
  },
]

// Known labels that map to a real route — everything else stays a placeholder "#" link.
const LINK_ROUTES: Record<string, string> = {
  Restaurants: '/restaurants',
  Cuisines: '/explore',
  Collections: '/collections',
  Offers: '/offers',
  'Partner with us': '/partner/restaurant',   // 🔥 NEW
}

const socials = [
  { short: 'IG', label: 'Instagram', href: '#' },
  { short: 'FB', label: 'Facebook', href: '#' },
  { short: 'YT', label: 'YouTube', href: '#' },
  { short: 'X', label: 'Twitter / X', href: '#' },
]

export function Footer() {
  return (
    <footer id="about" className="border-t border-charcoal/10 bg-charcoal text-cream/70">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <a href="#home" className="flex items-center gap-2">
              <div className="overflow-hidden rounded-xl bg-transparent p-1">
                <img
                  src="/images/logo/logo2.png"
                  alt="SanFoody Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Premium food, delivered fresh. Discover cuisines, order in seconds, taste the difference.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-[11px] font-bold text-cream/70 transition-colors hover:bg-tomato hover:text-cream"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold text-cream">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    {LINK_ROUTES[link] ? (
                      <Link to={LINK_ROUTES[link]} className="text-sm transition-colors hover:text-orange">
                        {link}
                      </Link>
                    ) : (
                      <a href="#" className="text-sm transition-colors hover:text-orange">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 text-xs sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Sanfoody. All rights reserved.</p>
          <p>Made with care, delivered with speed.</p>
        </div>
      </div>
    </footer>
  )
}