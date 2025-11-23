import { useState, useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const [nodes, setNodes] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [networkMode, setNetworkMode] = useState(0); // 0: Mesh, 1: Clusters, 2: Hexagonal, 3: Radial

  const trailRef = useRef([]);

  /* -----------------------------
      1) Mouse movement + extended trail
  ------------------------------*/
  useEffect(() => {
    const handleMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      setMousePos({ x, y });

      const newDot = {
        id: Date.now(),
        x,
        y,
        size: Math.random() * 15 + 10,
        opacity: 1
      };

      trailRef.current = [...trailRef.current, newDot].slice(-25);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  /* -----------------------------
      2) Create animated nodes based on network mode
  ------------------------------*/
  useEffect(() => {
    const generateNodes = () => {
      const nodeCount = 75; // Increased for more dense clusters
      
      switch(networkMode) {
        case 0: // Standard Mesh
          return Array.from({ length: nodeCount }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            cluster: Math.floor(Math.random() * 4)
          }));
        
        case 1: // Enhanced Clustered Network
          const clusters = [
            // Core clusters - positioned strategically
            { x: window.innerWidth * 0.2, y: window.innerHeight * 0.2, spread: 120, density: 0.18 },
            { x: window.innerWidth * 0.8, y: window.innerHeight * 0.25, spread: 140, density: 0.16 },
            { x: window.innerWidth * 0.3, y: window.innerHeight * 0.6, spread: 160, density: 0.2 },
            { x: window.innerWidth * 0.7, y: window.innerHeight * 0.65, spread: 130, density: 0.15 },
            { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35, spread: 110, density: 0.12 },
            // Additional peripheral clusters
            { x: window.innerWidth * 0.1, y: window.innerHeight * 0.5, spread: 90, density: 0.1 },
            { x: window.innerWidth * 0.9, y: window.innerHeight * 0.5, spread: 100, density: 0.1 },
            { x: window.innerWidth * 0.4, y: window.innerHeight * 0.85, spread: 120, density: 0.14 },
            { x: window.innerWidth * 0.6, y: window.innerHeight * 0.15, spread: 95, density: 0.11 }
          ];
          
          const clusterNodes = [];
          clusters.forEach((cluster, clusterIndex) => {
            const nodesInCluster = Math.floor(nodeCount * cluster.density);
            
            for (let i = 0; i < nodesInCluster; i++) {
              // Gaussian-like distribution for more natural clustering
              const angle = Math.random() * Math.PI * 2;
              const distance = Math.random() * cluster.spread * 0.7 + Math.random() * cluster.spread * 0.3;
              
              clusterNodes.push({
                x: cluster.x + Math.cos(angle) * distance,
                y: cluster.y + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                cluster: clusterIndex,
                isCluster: true,
                homeX: cluster.x,
                homeY: cluster.y,
                maxDistance: cluster.spread
              });
            }
          });

          // Fill remaining nodes as connectors between clusters
          const remainingNodes = nodeCount - clusterNodes.length;
          for (let i = 0; i < remainingNodes; i++) {
            clusterNodes.push({
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              vx: (Math.random() - 0.5) * 0.4,
              vy: (Math.random() - 0.5) * 0.4,
              cluster: Math.floor(Math.random() * clusters.length),
              isConnector: true
            });
          }

          return clusterNodes;
        
        case 2: // Hexagonal Grid
          const hexRadius = 55;
          const hexHeight = hexRadius * 2;
          const hexWidth = Math.sqrt(3) * hexRadius;
          const cols = Math.ceil(window.innerWidth / hexWidth) + 1;
          const rows = Math.ceil(window.innerHeight / hexHeight) + 1;
          
          const hexNodes = [];
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = col * hexWidth + (row % 2) * hexWidth / 2;
              const y = row * hexHeight * 0.75;
              if (x < window.innerWidth + 100 && y < window.innerHeight + 100) {
                hexNodes.push({
                  x,
                  y,
                  vx: (Math.random() - 0.5) * 0.2,
                  vy: (Math.random() - 0.5) * 0.2,
                  cluster: (row + col) % 4,
                  isHex: true
                });
              }
            }
          }
          return hexNodes;

        case 3: // Radial Concentric Circles
          const radialNodes = [];
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const circles = [3, 5, 7]; // Nodes per circle
          const radii = [80, 160, 240, 320]; // Circle radii

          radii.forEach((radius, circleIndex) => {
            const nodesInCircle = circles[circleIndex % circles.length];
            for (let i = 0; i < nodesInCircle; i++) {
              const angle = (i / nodesInCircle) * Math.PI * 2;
              radialNodes.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                cluster: circleIndex,
                isRadial: true,
                angle: angle,
                radius: radius,
                centerX: centerX,
                centerY: centerY
              });
            }
          });

          // Fill with additional random nodes
          while (radialNodes.length < nodeCount) {
            radialNodes.push({
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              vx: (Math.random() - 0.5) * 0.3,
              vy: (Math.random() - 0.5) * 0.3,
              cluster: Math.floor(Math.random() * 4),
              isConnector: true
            });
          }

          return radialNodes.slice(0, nodeCount);
        
        default:
          return [];
      }
    };

    setNodes(generateNodes());
  }, [networkMode]);

  /* -----------------------------
      3) Enhanced node movement with cluster behavior
  ------------------------------*/
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev =>
        prev.map(n => {
          let { x, y, vx, vy, isHex, isCluster, homeX, homeY, maxDistance, isRadial, angle, radius, centerX, centerY } = n;
          
          if (isCluster && homeX !== undefined) {
            // Cluster nodes try to stay near their home position
            const toHomeX = homeX - x;
            const toHomeY = homeY - y;
            const homeDist = Math.hypot(toHomeX, toHomeY);
            
            if (homeDist > maxDistance * 0.8) {
              // Return to cluster center
              vx += toHomeX * 0.001;
              vy += toHomeY * 0.001;
            }
            
            // Add some organic movement
            vx += (Math.random() - 0.5) * 0.05;
            vy += (Math.random() - 0.5) * 0.05;
            
            // Limit velocity
            const speed = Math.hypot(vx, vy);
            if (speed > 0.8) {
              vx = (vx / speed) * 0.8;
              vy = (vy / speed) * 0.8;
            }
            
            x += vx;
            y += vy;
            
          } else if (isRadial) {
            // Radial nodes orbit slowly
            angle += 0.002;
            x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
            y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
            
          } else if (isHex) {
            // Subtle movement for hex grid
            x += (Math.random() - 0.5) * 0.5;
            y += (Math.random() - 0.5) * 0.5;
            
            const driftLimit = 20;
            x = Math.max(-driftLimit, Math.min(window.innerWidth + driftLimit, x));
            y = Math.max(-driftLimit, Math.min(window.innerHeight + driftLimit, y));
            
          } else {
            // Standard random movement
            x += vx;
            y += vy;
            
            // Bounce off walls
            if (x < 0 || x > window.innerWidth) vx *= -1;
            if (y < 0 || y > window.innerHeight) vy *= -1;
          }

          return { ...n, x, y, vx, vy, angle };
        })
      );
    }, 40);
    return () => clearInterval(interval);
  }, [networkMode]);

  /* -----------------------------
      4) Cycle through network modes
  ------------------------------*/
  useEffect(() => {
    const cycleNetworks = setInterval(() => {
      setNetworkMode(prev => (prev + 1) % 4);
    }, 8000);

    return () => clearInterval(cycleNetworks);
  }, []);

  /* -----------------------------
      5) Enhanced connection rendering
  ------------------------------*/
  const renderConnections = () => {
    const connections = [];
    
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (i >= j) return;
        
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        let shouldConnect = false;
        let opacity = 0;
        let strokeWidth = 1;
        let strokeColor = '79,172,254';

        switch(networkMode) {
          case 0: // Mesh
            shouldConnect = dist < 140;
            opacity = 0.25 - dist / 600;
            break;
            
          case 1: // Enhanced Clusters
            const sameCluster = a.cluster === b.cluster;
            const bothClustered = a.isCluster && b.isCluster;
            
            if (bothClustered && sameCluster) {
              // Strong connections within same cluster
              shouldConnect = dist < 120;
              opacity = 0.4 - dist / 300;
              strokeWidth = 1.4;
              strokeColor = `79,172,254`;
            } else if (bothClustered && !sameCluster) {
              // Weaker connections between different clusters
              shouldConnect = dist < 180;
              opacity = 0.15 - dist / 1200;
              strokeWidth = 0.8;
              strokeColor = `246,211,101`;
            } else if (a.isConnector || b.isConnector) {
              // Connector nodes bridge clusters
              shouldConnect = dist < 160;
              opacity = 0.2 - dist / 800;
              strokeWidth = 1;
              strokeColor = `0,242,254`;
            }
            break;
            
          case 2: // Hexagonal
            shouldConnect = dist < 100;
            opacity = 0.3 - dist / 350;
            strokeWidth = 1.1;
            break;
            
          case 3: // Radial
            const sameRadialGroup = a.cluster === b.cluster;
            const radialDist = sameRadialGroup ? 100 : 150;
            shouldConnect = dist < radialDist;
            opacity = sameRadialGroup ? 0.35 - dist / 300 : 0.2 - dist / 750;
            strokeWidth = sameRadialGroup ? 1.3 : 0.9;
            break;
        }

        if (shouldConnect && opacity > 0.05) {
          connections.push(
            <line
              key={`line-${i}-${j}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={`rgba(${strokeColor},${opacity})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        }
      });
    });
    
    return connections;
  };

  return (
    <section className="hero">
      
      {/* --- AI Neural Mesh Background --- */}
      <svg className="neural-mesh">
        {renderConnections()}
      </svg>

      {/* --- Node Particles --- */}
      <div className="ai-nodes">
        {nodes.map((node, i) => {
          const dist = Math.hypot(node.x - mousePos.x, node.y - mousePos.y);
          const highlight = dist < 150;
          const clusterClass = `cluster-${node.cluster % 6}`;
          
          return (
            <div
              key={i}
              className={`ai-node ${clusterClass} ${highlight ? 'active' : ''} ${node.isHex ? 'hex-node' : ''} ${node.isRadial ? 'radial-node' : ''}`}
              style={{ 
                left: node.x, 
                top: node.y
              }}
            />
          );
        })}
      </div>

      {/* --- Enhanced Glow Trail --- */}
      <div className="trail-layer">
        {trailRef.current.map((dot, index) => {
          const progress = index / trailRef.current.length;
          const size = dot.size * (1 - progress * 0.7);
          const opacity = 0.9 * (1 - progress);
          
          return (
            <div
              key={dot.id}
              className="trail-dot"
              style={{ 
                left: dot.x, 
                top: dot.y,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
                animationDelay: `${index * 20}ms`
              }}
            />
          );
        })}
      </div>



      {/* --- Your Existing Content --- */}
      <div className="hero-container">
        <div className="hero-content">



          <h1 className="hero-title">
            Connecting Generations,<br />
            <span className="highlight">Building Community</span>
          </h1>

          <p className="hero-description">
            <span className="highlight-text">NebenanHelfer</span> bridges the gap 
            between Munich's seniors and students. AI-supported local help made simple.
          </p>

          <div className="hero-actions">
            <button className="btn-primary">
              <span>Start Your Journey</span>
              <span className="btn-icon">→</span>
            </button>

            <button className="btn-secondary glass-effect">
              <span className="play-icon">▶</span>
              <span>Watch How It Works</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;