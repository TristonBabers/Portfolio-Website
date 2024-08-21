import { Container, Row, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import pdf from '../assets/doc/Triston_Resume.pdf';
import resumeImage from '../assets/img/Triston_Resume.png';
import colorSharp from "../assets/img/color-sharp.png"

export const Resume = () => {
  return (
    <section>
      <Container fluid className="resume-section" id="resume">
      <Row style={{margin: "auto", textAlign: "center", padding: "20px 0 20px 0" }}>
        <h1>Resume</h1>
      </Row>
        <Row className="resume">
          <img 
            src={resumeImage} 
            alt="Triston's Resume"
            style={{ width: "80%", maxWidth: "1000px", margin: "auto"}}
          />
        </Row>
        <Row style={{ justifyContent: "center", position: "relative", padding: "20px" }}>
          <Button
          as="a"
          href={pdf} 
          download="Triston_Babers_Resume.pdf"
          variant="primary"
          style={{maxWidth: "250px", display: "block", margin: "0 auto"}}
        >
          Download Resume
        </Button>
        </Row>
      </Container>
      <img className="background-image-lower-left" src={colorSharp} alt="colorSharp" />
    </section>
  );
};