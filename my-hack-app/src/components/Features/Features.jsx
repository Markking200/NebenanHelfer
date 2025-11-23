import { useRef, useEffect, useState } from 'react';
import './Features.css';

const Features = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const featuresRef = useRef(null);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'Our intelligent system analyzes your needs and matches you with the most suitable student helpers in your area.',
      color: 'var(--primary-color)',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: '📞',
      title: 'Simple Phone Call',
      description: 'Just call us. No apps to download, no complicated forms. We handle everything through a friendly conversation.',
      color: 'var(--secondary-color)',
      gradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
    },
    {
      icon: '🛡️',
      title: 'Verified Helpers',
      description: 'All student helpers are verified and background-checked to ensure your safety and peace of mind.',
      color: 'var(--accent-color)',
      gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    },
    {
      icon: '⏱️',
      title: 'Quick Response',
      description: 'Get matched with helpers within minutes. Our system works 24/7 to connect you when you need help most.',
      color: 'var(--primary-color)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '💬',
      title: 'Clear Communication',
      description: 'Stay informed every step of the way. Get updates on your request status and helper availability.',
      color: 'var(--secondary-color)',
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    },
    {
      icon: '❤️',
      title: 'Community Building',
      description: 'Build lasting relationships with local students while strengthening your community connections.',
      color: 'var(--accent-color)',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    const cards = featuresRef.current?.querySelectorAll('.feature-card');
    cards?.forEach((card, index) => {
      card.dataset.index = index;
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="features">
      {/* Animated Background Elements */}
      <div className="features-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="connection-dots"></div>
      </div>

      <div className="features-container" ref={featuresRef}>
        <div className="features-header">
          
          <h2 className="section-title">
            Experience the Future of
            <span className="title-gradient"> Community Support</span>
          </h2>
          <p className="section-description">
            We combine cutting-edge AI technology with human compassion to create 
            a seamless experience that bridges generations and builds stronger communities.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${visibleCards.includes(index) ? 'visible' : ''}`}
              style={{ '--delay': index * 0.1 + 's' }}
            >
              {/* Card Background Glow */}
              <div 
                className="card-glow" 
                style={{ background: feature.gradient }}
              ></div>
              
              {/* Main Card Content */}
              <div className="card-content">
                <div className="feature-icon-container">
                  <div 
                    className="feature-icon-bg"
                    style={{ background: feature.gradient }}
                  ></div>
                  <div className="feature-icon">
                    <span>{feature.icon}</span>
                  </div>
                  <div className="icon-pulse"></div>
                </div>

                <h3 className="feature-title">
                  {feature.title}
                  <span className="title-underline"></span>
                </h3>
                
                <p className="feature-description">{feature.description}</p>
                
                
              </div>

              {/* Interactive Hover Element */}
              <div className="card-hover-effect"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="features-cta">
          <div className="cta-content">
            <h3>Ready to Experience Better Community Support?</h3>
            <p>Join thousands of seniors and students already connected through NebenanHelfer</p>
            <div className="cta-buttons">
              <button className="cta-button primary">
                I am a Senior Looking for Help
                <span className="button-sparkle"></span>
              </button>
              <button className="cta-button secondary">
                I am  student wanting to help
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;