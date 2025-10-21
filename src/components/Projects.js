import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import projImg1 from "../assets/img/project-img1.png";
import projImg2 from "../assets/img/project-img2.png";
import projImg3 from "../assets/img/project-img3.png";
import colorSharp2 from "../assets/img/color-sharp2.png";
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Projects = () => {

  const softwareProjects = [
    { title: "Outdoor Rentals System", description: "React + Firebase Web App", imgUrl: projImg1 },
    { title: "CalendAI", description: "Calendar Export & Sharing Platform", imgUrl: projImg2 },
    { title: "Gold Nuggets Game", description: "Multiplayer C Game", imgUrl: projImg3 },
  ];

  const mlProjects = [
    { title: "DJ Effect Detection", description: "Audio ML App – Python + Librosa", imgUrl: projImg2 },
    { title: "Amazon Review Classifier", description: "Text Sentiment ML (sklearn)", imgUrl: projImg3 },
    { title: "Basketball Win Predictor", description: "Stats-based Modeling", imgUrl: projImg1 },
  ];

  const designProjects = [
    { title: "3D Robot Character", description: "Maya + Substance 3D", imgUrl: projImg3 },
    { title: "Biped Animation Scene", description: "Choreographed Lighting & Motion", imgUrl: projImg1 },
    { title: "Ice Cream Finder App", description: "UI/UX + Google Maps API", imgUrl: projImg2 },
  ];

  return (
    <section className="project" id="projects">
      <Container>
        <Row>
          <Col size={12}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                  <h2>Projects</h2>
                  <p>Highlighted work across Software Engineering, Machine Learning, and Design — combining analytical thinking with creative problem solving.</p>

                  <Tab.Container id="projects-tabs" defaultActiveKey="software">
                    <Nav variant="pills" className="nav-pills mb-5 justify-content-center align-items-center" id="pills-tab">
                      <Nav.Item>
                        <Nav.Link eventKey="software">Software Engineering</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="ml">Machine Learning & Data</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="design">Design & 3D Modelling</Nav.Link>
                      </Nav.Item>
                    </Nav>

                    <Tab.Content id="slideInUp" className={isVisible ? "animate__animated animate__slideInUp" : ""}>
                      <Tab.Pane eventKey="software">
                        <Row>
                          {softwareProjects.map((project, index) => (
                            <ProjectCard key={index} {...project} />
                          ))}
                        </Row>
                      </Tab.Pane>

                      <Tab.Pane eventKey="ml">
                        <Row>
                          {mlProjects.map((project, index) => (
                            <ProjectCard key={index} {...project} />
                          ))}
                        </Row>
                      </Tab.Pane>

                      <Tab.Pane eventKey="design">
                        <Row>
                          {designProjects.map((project, index) => (
                            <ProjectCard key={index} {...project} />
                          ))}
                        </Row>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </div>
              }
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2} alt="background" />
    </section>
  )
}
