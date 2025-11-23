import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Make a Call',
      description: 'Simply call our service and speak with our friendly AI assistant. Tell us what you need help with.',
      icon: '📞'
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our AI system analyzes your request, understands your needs, and identifies the best type of help required.',
      icon: '🤖'
    },
    {
      number: '03',
      title: 'Find Helpers',
      description: 'We search our network of verified student helpers and match you with the most suitable candidates.',
      icon: '🔍'
    },
    {
      number: '04',
      title: 'Get Connected',
      description: 'You receive contact information for matched helpers. Connect directly and arrange your assistance.',
      icon: '🤝'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-description">
            Getting help is simple. Just follow these four easy steps.
          </p>
        </div>
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="step-connector">
                  <div className="connector-line"></div>
                  <div className="connector-arrow">→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

