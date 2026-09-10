import { useEffect, useState } from "react";

export const Newsletter = ({ status, message, onValidated }) => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (status === "success") setEmail("");
  }, [status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.indexOf("@") > -1) {
      onValidated({ EMAIL: email });
    }
  };

  return (
    <form className="newsletter" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email">Newsletter</label>
      <div className="newsletter__row">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
        />
        <button type="submit">Subscribe</button>
      </div>
      <p className="newsletter__status" role="status" aria-live="polite">
        {status === "sending" && "Sending…"}
        {status === "error" && message}
        {status === "success" && message}
      </p>
    </form>
  );
};
