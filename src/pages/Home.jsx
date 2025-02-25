import { Banner } from "../components/Banner";
import { Skills } from "../components/Skills";
import { Projects } from "../components/Projects";
import { Resume } from "../components/Resume";
import { Contact } from "../components/Contact";

export const Home = () => {
  return (
    <>
      <Banner />
      <Skills />
      <Projects />
      <Resume />
      <Contact />
    </>
  );
};