import { MailchimpForm } from "./MailchimpForm";
import { social } from "../data/profile";
import { GitHubIcon, LinkedInIcon } from "../icons";

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="section-shell site-footer__grid">
        <MailchimpForm />
        <div className="site-footer__meta">
          <div className="social-icons">
            <a href={social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <GitHubIcon />
            </a>
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
          </div>
          <p>© {new Date().getFullYear()} Godwin Kangor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
