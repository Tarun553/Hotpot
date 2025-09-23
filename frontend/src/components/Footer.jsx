import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

// Text Arc Effect Component
const TextArc = ({ text, diameter = 160 }) => {
  const characters = text.split('');
  const radius = diameter / 2;
  const angleStep = 360 / characters.length;

  return (
    <div className="relative" style={{ width: diameter, height: diameter }}>
      {characters.map((char, index) => {
        const angle = angleStep * index;
        const charStyle = {
          position: 'absolute',
          height: `${radius}px`,
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'bottom center',
          top: 0,
          left: '50%',
          marginLeft: '-0.5em',
        };

        return (
          <div key={index} style={charStyle}>
            <span className="text-xs md:text-sm font-bold text-orange-600 dark:text-orange-400">
              {char}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Developer Photo Component
const DeveloperPhoto = () => (
  <img
    src="https://avatars.githubusercontent.com/u/180714740?v=4" // Replace with your GitHub profile photo
    alt="Developer - Tarun"
    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shadow-lg border-2 border-orange-500"
    onError={(e) => { 
      e.target.onerror = null; 
      e.target.src = 'https://ui-avatars.com/api/?name=Tarun&background=ff6600&color=fff&size=56'; 
    }}
  />
);

const Footer = () => {
  const [diameter, setDiameter] = useState(140);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDiameter(100);
      } else {
        setDiameter(120);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety', href: '/safety' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' }
    ],
    social: [
      { name: 'GitHub', icon: Github, href: 'https://github.com/Tarun553' },
      { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/tarun-choudhary-553b6b364/' },
      { name: 'Twitter', icon: Twitter, href: 'https://x.com/07Tarunnn' }
    ]
  };

  return (
    <footer className="bg-gradient-to-br from-orange-50 to-orange-100 border-t border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🍲</span>
              </div>
              <h3 className="text-2xl font-bold text-orange-700">Hotpot</h3>
            </div>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Delicious food delivered fast. Experience the best local restaurants 
              and cuisines right at your doorstep.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Serving in 100+ cities</span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 hover:text-orange-600 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-600 hover:text-orange-600 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@hotpot.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-3 mt-4">
              {footerLinks.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Developer Section with Text Arc Effect */}
        <div className="border-t border-orange-200 pt-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Text Arc with Developer Photo */}
              <div className="relative flex items-center justify-center mb-2 lg:mb-0">
                <motion.div
                  className="absolute"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 25,
                    ease: 'linear',
                  }}
                >
                  <TextArc text=" • CRAFTED WITH LOVE • BY TARUN •" diameter={diameter} />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  className="relative z-10"
                >
                  <DeveloperPhoto />
                </motion.div>
              </div>

              {/* Developer Info */}
              <div className="text-center ml-2 lg:text-left mt-1.5">
                <h5 className="font-semibold text-gray-900 mb-1 text-sm">Built by Tarun</h5>
                <p className="text-xs text-gray-600 mb-2">Full Stack Developer</p>
                <div className="flex items-center justify-center lg:justify-start space-x-1">
                  <span className="text-xs text-gray-500">Made with</span>
                  <Heart className="w-3 h-3 text-red-500 fill-current" />
                  <span className="text-xs text-gray-500">and lots of</span>
                  <span className="text-orange-500 text-sm">🍕</span>
                </div>
              </div>
            </div>

            {/* App Info */}
            <div className="text-center lg:text-right mt-4 lg:mt-0">
              <div className="flex items-center justify-center lg:justify-end space-x-2 mb-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  v2.1.0
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Online
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-orange-200 pt-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            © {new Date().getFullYear()} Hotpot. All rights reserved.
          </p>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>🔒 Secure Payments</span>
            <span>⚡ Fast Delivery</span>
            <span>📱 Mobile App Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;