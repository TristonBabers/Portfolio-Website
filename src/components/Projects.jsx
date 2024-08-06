import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import projImg1 from "../assets/img/project-img1.png";
import projImg2 from "../assets/img/project-img2.png";
import projImg3 from "../assets/img/floating-point-banner.avif";
import projImg4 from "../assets/img/project-img3.png";
import projImg5 from "../assets/img/project-img5.png";
import colorSharp2 from "../assets/img/color-sharp2.png";
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Projects = () => {
  const projects = [
    {
      title: "RLC Solver",
      description: "Solves any RLC circuit that construct. Uses C++ to scaffold the formulas on the backend and then computes the answers on the frontend using Math.js.",
      imgUrl: projImg1,
      demoUrl: "./rlc-solver/"
    },
    {
      title: "Relational SQL Database",
      description: "A MySQL-like recreated in C++ from scratch. Supports filtering using the \"WHERE\" keyword and projecting data using \"JOIN\". Stores and retrieves data locally in .db files.",
      imgUrl: projImg2,
      articleUrl: "https://tristonbabers.com/articles/relational-database/",
      isArticle: true,
    },
    {
      title: "Floating Point Convertor",
      description: "Displays any 32-bits as a floating point formatted to work with seven-segment displays. Built using a state machine in SystemVerilog.",
      imgUrl: projImg3,
      articleUrl: "https://github.com/TristonBabers/Floating-Point-Convertor",
    },
    {
      title: "Custom Pipelined Processor",
      description: "A custom RISC processor in System Verilog that executes a custom programming languages. Implements pipelining for increased performance, and uses an ISA constrained to being 11 bits wide.",
      imgUrl: projImg4,
      articleUrl: "https://tristonbabers.com/articles/custom-processor/",
      isArticle: true,
    },
    {
      title: "Recipe Manager App",
      description: "CRUD Application that stores recipes you design in your browser's local storage. Made using HTML5, CSS, and Javascript.",
      imgUrl: projImg5,
      articleUrl: "https://github.com/cse110-sp21-group36/cse110-sp21-group36/tree/main",
      demoUrl: "https://cse110-sp21-group36.github.io/cse110-sp21-group36/source/recipe_manager.html"
    },
  ];

  return (
    <Container fluid className="project-section">
      <Container id="projects">
        <h1 className="project-heading">
          My Projects
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
        {
          projects.map((project, index) => {
            return (
              <Col className="project-row" key={index} md={4}>
                <ProjectCard
                  key={index}
                  {...project}
                  />
              </Col>
            );
          })
        }
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2} alt="Image" />
    </Container>
  );
}