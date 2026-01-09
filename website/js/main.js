// Website JavaScript — Accessibility Widget v1 Documentation

(function() {
  'use strict';

  // Mobile menu toggle
  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var navLinks = document.querySelector('.nav-links');
    
    if (toggle && navLinks) {
      toggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        var isOpen = navLinks.classList.contains('active');
        toggle.setAttribute('aria-expanded', isOpen);
        toggle.textContent = isOpen ? '✕' : '☰';
      });
    }
  }

  // Copy code block functionality
  function initCodeCopy() {
    var copyButtons = document.querySelectorAll('.code-block-copy');
    
    copyButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        var codeBlock = button.parentElement.querySelector('pre code');
        if (codeBlock) {
          var text = codeBlock.textContent;
          navigator.clipboard.writeText(text).then(function() {
            var originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(function() {
              button.textContent = originalText;
            }, 2000);
          }).catch(function(err) {
            console.error('Failed to copy:', err);
          });
        }
      });
    });
  }

  // Set active nav link based on current page
  function setActiveNavLink() {
    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(function(link) {
      var linkPath = new URL(link.href).pathname;
      if (currentPath === linkPath || 
          (currentPath === '/' && linkPath.includes('index.html')) ||
          (currentPath.includes(linkPath) && linkPath !== '/')) {
        link.classList.add('active');
      }
    });
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = link.getAttribute('href');
        if (href !== '#' && href.length > 1) {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initMobileMenu();
      initCodeCopy();
      setActiveNavLink();
      initSmoothScroll();
    });
  } else {
    initMobileMenu();
    initCodeCopy();
    setActiveNavLink();
    initSmoothScroll();
  }
})();

