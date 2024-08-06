import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { ReactComponent as ArticleIcon } from '../assets/img/article.svg';
import { ReactComponent as GitHubIcon } from '../assets/img/nav-icon1.svg';
import { ReactComponent as DemoIcon } from '../assets/img/demo.svg';

export const ProjectCard = ({ title, description, imgUrl, articleUrl='', isArticle=false, demoUrl=''}) => {
  return (
    <Card className="project-card-view">
      <Card.Img variant="top" src={imgUrl} alt="card-img" />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text style={{ textAlign: "justify" }}>
          {description}
        </Card.Text>
        <Button variant="primary" href={articleUrl} target="_blank">
          {isArticle ? (
            <ArticleIcon style={{ marginRight: "8px" }} />
          ) : (
            <GitHubIcon style={{ marginRight: "8px" }} />
          )}
          {isArticle ? "Article" : "GitHub"}
        </Button>
        {"\n"}
        {"\n"}
        {demoUrl && (
          <Button
            variant="primary"
            href={demoUrl}
            target="_blank"
            style={{ marginLeft: "10px" }}
          >
            <DemoIcon style={{ marginRight: "8px" }} />
            {"Demo"}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}