import { useState } from "react";
import { social } from "../data/profile";

const initialDetails = { name: "", email: "", message: "" };

export const Contact = () => {
  const formspreeId = process.env.REACT_APP_FORMSPREE_ID;
  const isConfigured = Boolean(formspreeId);

  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const onChange = (field) => (e) =>
    setDetails((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!details.name.trim()) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(details.email)) next.email = "Please enter a valid email address.";
    if (!details.message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending" || !isConfigured) return;
    if (!validate()) return;

    setStatus("sending");
    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(details),
      });
      if (response.ok) {
        setDetails(initialDetails);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="contact" id="connect">
      <div className="section-shell contact__grid">
        <div>
          <p className="section-label">Contact</p>
          <h2>Get in touch</h2>
          <p className="contact__intro">
            Reach out about a project, opportunity, or anything else — or find me directly:
          </p>
          <div className="contact__social">
            <a href={social.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <div>
          {!isConfigured ? (
            <p className="contact__fallback">
              The contact form isn't configured yet. In the meantime, reach out on{" "}
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>{" "}
              or{" "}
              <a href={social.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  value={details.name}
                  onChange={onChange("name")}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  required
                />
                {errors.name && (
                  <p className="field__error" id="contact-name-error">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={details.email}
                  onChange={onChange("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  required
                />
                {errors.email && (
                  <p className="field__error" id="contact-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  rows="5"
                  value={details.message}
                  onChange={onChange("message")}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  required
                />
                {errors.message && (
                  <p className="field__error" id="contact-message-error">
                    {errors.message}
                  </p>
                )}
              </div>

              <button type="submit" className="button button--primary" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
              </button>

              <p className="contact__status" role="status" aria-live="polite">
                {status === "success" && "Message sent — thank you for reaching out."}
                {status === "error" && "Something went wrong. Please try again or reach out on LinkedIn/GitHub."}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
