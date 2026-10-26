import React, { useState } from 'react';
import { Phone, Mail, ArrowUp, MapPin } from 'lucide-react';
import { Category } from '../types';

export interface FooterProps {
  categories: Category[];
  onSelectCategory?: (category: any) => void;
}

const LOGO_URL =
  'https://i.ibb.co/RpyPhr4d/Polished-Gold-House-E-Emblem.png';

const BRANCH_1_ADDRESS =
  '1st Floor, Beside Model Basic High School on Main Road, Rahmaniah Masjid Lane, Opposite to HP Petrol Pump, Mahbubnagar, Telangana 509001';

const BRANCH_2_ADDRESS =
  'H. No. 172, Street 7, Al Hasnath Colony, Tolichowki, Hyderabad, Telangana 500008';

const BRANCH_1_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=1st+Floor+Beside+Model+Basic+High+School+Main+Road+Rahmaniah+Masjid+Lane+Opposite+HP+Petrol+Pump+Mahbubnagar+Telangana+509001';

const BRANCH_2_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=H.No+172+Street+7+Al+Hasnath+Colony+Tolichowki+Hyderabad+Telangana+500008';

const INSTAGRAM_URL =
  'https://www.instagram.com/luxeupho_homeinteriors/';

const YOUTUBE_URL =
  'https://www.youtube.com/@LuxeuphoHomes';

export const Footer: React.FC<FooterProps> = ({
  categories,
  onSelectCategory,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail('');
  };

  const handleCategoryClick = (category: Category) => {
    if (onSelectCategory) {
      onSelectCategory(category.name || category);
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="border-t border-yellow-200 bg-yellow-50 text-gray-700">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND AND CONTACT */}
          <div>
            <a
              href="/"
              aria-label="LEXUPHO Home Interiors home"
              className="mb-4 inline-flex items-center"
            >
              <img
                src={LOGO_URL}
                alt="LEXUPHO Home Interiors"
                className="h-20 w-auto object-contain"
              />
            </a>

            <p className="mb-5 text-sm leading-6 text-gray-600">
              Transform your space with LEXUPHO Home Interiors.
              Discover elegant furniture and thoughtfully designed
              interiors that bring comfort and style to your home.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="tel:9704796170"
                className="flex items-center gap-3 text-sm transition-colors hover:text-yellow-700"
              >
                <Phone size={17} className="shrink-0 text-yellow-700" />
                <span>9704796170</span>
              </a>

              <a
                href="mailto:luxeuphohomeinteriors@gmail.com"
                className="flex items-center gap-3 text-sm transition-colors hover:text-yellow-700"
              >
                <Mail size={17} className="shrink-0 text-yellow-700" />
                <span className="break-all">
                  luxeuphohomeinteriors@gmail.com
                </span>
              </a>
            </div>

            {/* SOCIAL LINKS */}
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Follow Us
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Luxeupho Instagram"
                  className="font-medium transition-colors hover:text-yellow-700"
                >
                  Instagram
                </a>

                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Luxeupho YouTube"
                  className="font-medium transition-colors hover:text-yellow-700"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* CLICKABLE COLLECTIONS */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-gray-900">
              Collections
            </h3>

            {categories.length > 0 ? (
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                      className="cursor-pointer text-left text-sm text-gray-600 transition-colors hover:text-yellow-700"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Collections are currently unavailable.
              </p>
            )}
          </div>

          {/* BRANCH ADDRESSES */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-gray-900">
              Our Locations
            </h3>

            <div className="space-y-6">

              {/* BRANCH 1 */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">
                  Branch 1 – Mahbubnagar
                </h4>

                <a
                  href={BRANCH_1_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm leading-6 text-gray-600 transition-colors hover:text-yellow-700"
                >
                  <MapPin
                    size={18}
                    className="mt-1 shrink-0 text-yellow-700"
                  />
                  <span>{BRANCH_1_ADDRESS}</span>
                </a>

                <a
                  href={BRANCH_1_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-6 mt-2 inline-block text-xs font-semibold text-yellow-700 hover:underline"
                >
                  Get Directions →
                </a>
              </div>

              {/* BRANCH 2 */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">
                  Branch 2 – Hyderabad
                </h4>

                <a
                  href={BRANCH_2_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm leading-6 text-gray-600 transition-colors hover:text-yellow-700"
                >
                  <MapPin
                    size={18}
                    className="mt-1 shrink-0 text-yellow-700"
                  />
                  <span>{BRANCH_2_ADDRESS}</span>
                </a>

                <a
                  href={BRANCH_2_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-6 mt-2 inline-block text-xs font-semibold text-yellow-700 hover:underline"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          </div>

          {/* NEWSLETTER AND CUSTOMER CARE */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-gray-900">
              Stay Connected
            </h3>

            <p className="mb-4 text-sm leading-6 text-gray-600">
              Get updates about our latest furniture collections and
              interior inspiration.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>

              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSubscribed(false);
                }}
                placeholder="Enter your email address"
                required
                className="w-full min-w-0 rounded-md border border-yellow-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600"
              />

              <button
                type="submit"
                className="w-full rounded-md bg-yellow-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
              >
                Subscribe
              </button>

              {subscribed && (
                <p role="status" className="text-sm text-green-700">
                  Thank you for subscribing!
                </p>
              )}
            </form>

            <div className="mt-7">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">
                Customer Care
              </h4>

              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <a
                    href="tel:9704796170"
                    className="transition-colors hover:text-yellow-700"
                  >
                    Contact Us
                  </a>
                </li>

                <li>
                  <a
                    href="mailto:luxeuphohomeinteriors@gmail.com"
                    className="transition-colors hover:text-yellow-700"
                  >
                    Email Support
                  </a>
                </li>

                <li className="pt-1 text-xs text-gray-600">
                  <span className="font-medium text-gray-800">
                    Business Timings:
                  </span>{' '}
                  10:00 AM – 7:00 PM (Mon – Sun)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT AND BACK TO TOP */}
      <div className="border-t border-yellow-200 bg-yellow-100/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:px-8">
          <p className="text-center text-xs text-gray-600 lg:text-left">
            © {new Date().getFullYear()} Luxeupho Home Interiors.
            All rights reserved.
          </p>

          <button
            type="button"
            onClick={handleBackToTop}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 transition-colors hover:text-yellow-700"
          >
            Back to Top
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;