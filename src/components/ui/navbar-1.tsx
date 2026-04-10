"use client" 

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const Navbar1 = () => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => setIsOpen(!isOpen)
  const location = useLocation()

  // Map links to our established routes: Portfolio, The Man (About), Contact
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Portfolio", path: "/portfolio" },
    { label: "The Man", path: "/about" }
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] flex justify-center w-full py-6 px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg w-full max-w-3xl relative z-10 border border-white/20">
        <div className="flex items-center">
          <Link to="/">
            <motion.div
              className="w-8 h-8 mr-6 bg-primary flex items-center justify-center rounded-sm font-accent text-white leading-none"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              R
            </motion.div>
          </Link>
        </div>
        
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <Link 
                    to={item.path} 
                    className={`text-[13px] hover:text-primary transition-colors font-box uppercase tracking-wider ${isActive ? "text-primary" : "text-black"}`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

        {/* Desktop CTA Button */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-5 py-2 text-[11px] uppercase font-box tracking-widest text-white bg-black rounded-full hover:bg-primary transition-colors"
          >
            LET'S MIX
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-black" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[2000] pt-24 pb-12 px-6 md:hidden overflow-y-auto"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-black" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Link 
                      to={item.path} 
                      className={`text-[clamp(2.5rem,8vw,3rem)] font-box uppercase transition-colors ${isActive ? "text-primary" : "text-black"}`} 
                      onClick={toggleMenu}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center w-full px-5 py-6 text-xl sm:text-2xl font-box uppercase text-white bg-black rounded-md hover:bg-primary transition-colors"
                  onClick={toggleMenu}
                >
                  LET'S MIX
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
