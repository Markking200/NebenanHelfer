import './TrustSection.css';

const TrustSection = () => {
  const testimonials = [
    {
      name: 'Helga M.',
      age: 72,
      location: 'Munich',
      text: 'NebenanHelfer has been a lifesaver! The students are so kind and helpful. I feel safe and supported.',
      rating: 5
    },
    {
      name: 'Klaus W.',
      age: 68,
      location: 'Munich',
      text: 'The AI system understood exactly what I needed. I was matched with a wonderful student within an hour!',
      rating: 5
    },
    {
      name: 'Ingrid K.',
      age: 75,
      location: 'Munich',
      text: 'I love how simple it is. Just one phone call and everything is taken care of. Highly recommend!',
      rating: 5
    }
  ];

  const trustBadges = [
    { icon: '🔒', text: 'Secure & Private' },
    { icon: '✅', text: 'Verified Helpers' },
    { icon: '⭐', text: '5-Star Rated' },
    { icon: '🏆', text: 'Award Winning' }
  ];

  return (
    <section className="trust-section">
      <div className="trust-container">
        <div className="trust-header">
          <h2 className="section-title">Trusted by Our Community</h2>
          <p className="section-description">
            Join hundreds of seniors who have found reliable help through NebenanHelfer
          </p>
        </div>

        <div className="trust-badges">
          {trustBadges.map((badge, index) => (
            <div key={index} className="trust-badge">
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-text">{badge.text}</span>
            </div>
          ))}
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-details">
                    {testimonial.age} • {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

