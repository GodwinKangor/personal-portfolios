import MailchimpSubscribe from "react-mailchimp-subscribe";
import { Newsletter } from "./Newsletter";

const { REACT_APP_MAILCHIMP_URL, REACT_APP_MAILCHIMP_U, REACT_APP_MAILCHIMP_ID } = process.env;

export const isMailchimpConfigured = Boolean(
  REACT_APP_MAILCHIMP_URL && REACT_APP_MAILCHIMP_U && REACT_APP_MAILCHIMP_ID
);

export const MailchimpForm = () => {
  if (!isMailchimpConfigured) return null;

  const postUrl = `${REACT_APP_MAILCHIMP_URL}?u=${REACT_APP_MAILCHIMP_U}&id=${REACT_APP_MAILCHIMP_ID}`;

  return (
    <MailchimpSubscribe
      url={postUrl}
      render={({ subscribe, status, message }) => (
        <Newsletter status={status} message={message} onValidated={(formData) => subscribe(formData)} />
      )}
    />
  );
};
